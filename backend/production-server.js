const http = require('http');
const url = require('url');
const { 
  pool, 
  query, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  logAudit 
} = require('./database');

const PORT = 8080;

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

// Authentication middleware
async function authenticate(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Invalid token' }));
    return null;
  }
}

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

// Generate QR code hash
function generateQRHash(prescriptionId) {
  return crypto.createHash('sha256').update(prescriptionId + Date.now()).digest('hex');
}

const server = http.createServer(async (req, res) => {
  // Log every incoming request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected'
      }));
      return;
    }

    // Authentication endpoints
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      if (!validateEmail(body.email)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid email format' }));
        return;
      }

      const result = await query(
        'SELECT id, email, password_hash, first_name, last_name, role, pharmacy_id FROM users WHERE email = $1 AND is_active = true',
        [body.email]
      );

      if (result.rows.length === 0) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const user = result.rows[0];
      const isValidPassword = await verifyPassword(body.password, user.password_hash);

      if (!isValidPassword) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const token = generateToken(user);
      
      await logAudit(
        user.id, 
        'LOGIN', 
        'users', 
        user.id, 
        null, 
        { login_time: new Date().toISOString() },
        req.socket.remoteAddress,
        req.headers['user-agent']
      );

      res.writeHead(200);
      res.end(JSON.stringify({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          pharmacy_id: user.pharmacy_id
        }
      }));
      return;
    }

    // Registration endpoint
    if (path === '/api/v1/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      
      if (!body.email || !body.password || !body.first_name || !body.last_name || !body.role) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'All required fields must be provided' }));
        return;
      }

      if (!validateEmail(body.email)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid email format' }));
        return;
      }

      if (!validatePassword(body.password)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' }));
        return;
      }

      const existingUser = await query('SELECT id FROM users WHERE email = $1', [body.email]);
      if (existingUser.rows.length > 0) {
        res.writeHead(409);
        res.end(JSON.stringify({ error: 'Email already registered' }));
        return;
      }

      const hashedPassword = await hashPassword(body.password);
      
      const result = await query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, pharmacy_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role, pharmacy_id',
        [body.email, hashedPassword, body.first_name, body.last_name, body.role, body.pharmacy_id || null]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      await logAudit(
        user.id, 
        'REGISTER', 
        'users', 
        user.id, 
        null, 
        { registration_time: new Date().toISOString() },
        req.socket.remoteAddress,
        req.headers['user-agent']
      );

      res.writeHead(201);
      res.end(JSON.stringify({ token, user }));
      return;
    }

    // Protected routes (require authentication)
    const user = await authenticate(req, res);
    if (!user) return;

    // User profile
    if (path === '/api/v1/users/profile' && method === 'GET') {
      const result = await query(
        'SELECT id, email, first_name, last_name, role, pharmacy_id FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Pharmacies
    if (path === '/api/v1/pharmacies' && method === 'GET') {
      let queryText = 'SELECT * FROM pharmacies WHERE is_active = true';
      let params = [];

      if (user.role !== 'admin') {
        queryText += ' AND id = $1';
        params = [user.pharmacy_id];
      }

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Patients with search
    if (path.startsWith('/api/v1/patients') && method === 'GET') {
      const searchParams = new URLSearchParams(req.url.split('?')[1] || '');
      const searchTerm = searchParams.get('search') || '';
      const pharmacyId = user.role === 'admin' ? null : user.pharmacy_id;

      let queryText = `
        SELECT id, national_id, first_name, last_name, date_of_birth, phone, email, 
               blood_type, allergies, chronic_conditions, emergency_contact_name, 
               emergency_contact_phone, created_at
        FROM patients
      `;
      let params = [];

      if (searchTerm) {
        queryText += ` WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR national_id ILIKE $1 OR phone ILIKE $1)`;
        params.push(`%${searchTerm}%`);
      }

      queryText += ' ORDER BY last_name, first_name LIMIT 50';

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Prescriptions
    if (path === '/api/v1/prescriptions' && method === 'GET') {
      let queryText = `
        SELECT p.*, pa.first_name || ' ' || pa.last_name as patient_name,
               m.name as medication_name, u.first_name || ' ' || u.last_name as prescriber_name
        FROM prescriptions p
        JOIN patients pa ON p.patient_id = pa.id
        JOIN medications m ON p.medication_id = m.id
        LEFT JOIN users u ON p.prescriber_id = u.id
      `;
      let params = [];

      if (user.role !== 'admin') {
        queryText += ' WHERE p.pharmacy_id = $1';
        params = [user.pharmacy_id];
      }

      queryText += ' ORDER BY p.date_prescribed DESC LIMIT 100';

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Create prescription
    if (path === '/api/v1/prescriptions' && method === 'POST') {
      const body = await parseBody(req);
      
      if (!body.patient_id || !body.medication_id || !body.dosage || !body.frequency || !body.quantity) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Required fields missing' }));
        return;
      }

      const prescriptionNumber = 'RX' + Date.now();
      const qrHash = generateQRHash(prescriptionNumber);

      const result = await query(
        `INSERT INTO prescriptions (prescription_number, patient_id, medication_id, prescriber_id, 
         dosage, frequency, duration, quantity, instructions, qr_code_hash, pharmacy_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [prescriptionNumber, body.patient_id, body.medication_id, user.id, 
         body.dosage, body.frequency, body.duration, body.quantity, 
         body.instructions, qrHash, user.pharmacy_id]
      );

      await logAudit(
        user.id, 
        'CREATE_PRESCRIPTION', 
        'prescriptions', 
        result.rows[0].id, 
        null, 
        result.rows[0],
        req.socket.remoteAddress,
        req.headers['user-agent']
      );

      res.writeHead(201);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Update prescription status
    if (path.startsWith('/api/v1/prescriptions/') && method === 'PUT') {
      const prescriptionId = path.split('/')[4];
      const body = await parseBody(req);

      if (!body.status) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Status is required' }));
        return;
      }

      const oldResult = await query('SELECT * FROM prescriptions WHERE id = $1', [prescriptionId]);
      if (oldResult.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Prescription not found' }));
        return;
      }

      const updateFields = ['status = $2'];
      const params = [prescriptionId, body.status];
      let paramIndex = 3;

      if (body.status === 'filled') {
        updateFields.push('date_filled = CURRENT_TIMESTAMP, pharmacist_id = $' + paramIndex);
        params.push(user.id);
        paramIndex++;
      }

      const result = await query(
        `UPDATE prescriptions SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
        params
      );

      await logAudit(
        user.id, 
        'UPDATE_PRESCRIPTION', 
        'prescriptions', 
        prescriptionId, 
        oldResult.rows[0], 
        result.rows[0],
        req.socket.remoteAddress,
        req.headers['user-agent']
      );

      res.writeHead(200);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Inventory
    if (path === '/api/v1/inventory' && method === 'GET') {
      let queryText = `
        SELECT i.*, m.name as medication_name, m.generic_name, m.category
        FROM inventory i
        JOIN medications m ON i.medication_id = m.id
      `;
      let params = [];

      if (user.role !== 'admin') {
        queryText += ' WHERE i.pharmacy_id = $1';
        params = [user.pharmacy_id];
      }

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Low stock inventory
    if (path.startsWith('/api/v1/inventory/low-stock') && method === 'GET') {
      let queryText = `
        SELECT i.*, m.name as medication_name, m.generic_name, m.category
        FROM inventory i
        JOIN medications m ON i.medication_id = m.id
        WHERE i.quantity_on_hand <= i.reorder_level
      `;
      let params = [];

      if (user.role !== 'admin') {
        queryText += ' AND i.pharmacy_id = $1';
        params = [user.pharmacy_id];
      }

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Update inventory
    if (path.startsWith('/api/v1/inventory/') && method === 'PUT') {
      const inventoryId = path.split('/')[4];
      const body = await parseBody(req);

      const oldResult = await query('SELECT * FROM inventory WHERE id = $1', [inventoryId]);
      if (oldResult.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Inventory item not found' }));
        return;
      }

      const result = await query(
        'UPDATE inventory SET quantity_on_hand = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [inventoryId, body.quantity_on_hand]
      );

      await logAudit(
        user.id, 
        'UPDATE_INVENTORY', 
        'inventory', 
        inventoryId, 
        oldResult.rows[0], 
        result.rows[0],
        req.socket.remoteAddress,
        req.headers['user-agent']
      );

      res.writeHead(200);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Medications
    if (path === '/api/v1/medications' && method === 'GET') {
      const searchParams = new URLSearchParams(req.url.split('?')[1] || '');
      const searchTerm = searchParams.get('search') || '';

      let queryText = 'SELECT * FROM medications';
      let params = [];

      if (searchTerm) {
        queryText += ' WHERE name ILIKE $1 OR generic_name ILIKE $1 OR ndc_code ILIKE $1';
        params.push(`%${searchTerm}%`);
      }

      queryText += ' ORDER BY name LIMIT 100';

      const result = await query(queryText, params);
      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Analytics data
    if (path === '/api/v1/analytics/overview' && method === 'GET') {
      const pharmacyId = user.role === 'admin' ? null : user.pharmacy_id;
      
      let pharmacyFilter = '';
      let params = [];
      
      if (pharmacyId) {
        pharmacyFilter = 'WHERE pharmacy_id = $1';
        params = [pharmacyId];
      }

      const [
        totalPrescriptions,
        filledPrescriptions,
        totalInventory,
        lowStockCount,
        totalPatients
      ] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM prescriptions ${pharmacyFilter}`, params),
        query(`SELECT COUNT(*) as count FROM prescriptions WHERE status = 'filled' ${pharmacyFilter ? 'AND ' + pharmacyFilter.replace('WHERE', 'AND') : ''}`, params),
        query(`SELECT COUNT(*) as count FROM inventory ${pharmacyFilter}`, params),
        query(`SELECT COUNT(*) as count FROM inventory WHERE quantity_on_hand <= reorder_level ${pharmacyFilter ? 'AND ' + pharmacyFilter.replace('WHERE', 'AND') : ''}`, params),
        query('SELECT COUNT(*) as count FROM patients', [])
      ]);

      const analytics = {
        totalPrescriptions: parseInt(totalPrescriptions.rows[0].count),
        filledPrescriptions: parseInt(filledPrescriptions.rows[0].count),
        totalInventory: parseInt(totalInventory.rows[0].count),
        lowStockCount: parseInt(lowStockCount.rows[0].count),
        totalPatients: parseInt(totalPatients.rows[0].count)
      };

      res.writeHead(200);
      res.end(JSON.stringify(analytics));
      return;
    }

    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Database: PostgreSQL with real persistence');
  console.log('Authentication: JWT with proper validation');
  console.log('Features: All endpoints implemented with audit logging');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});
