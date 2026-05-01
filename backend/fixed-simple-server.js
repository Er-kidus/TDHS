const http = require('http');
const url = require('url');

const PORT = 8080;

// Simple in-memory data
const users = [
  { id: 1, email: 'admin@test.com', password: 'admin123', first_name: 'Admin', last_name: 'User', role: 'admin' },
  { id: 2, email: 'pharmacist@test.com', password: 'pharm123', first_name: 'John', last_name: 'Pharmacist', role: 'pharmacist' },
  { id: 3, email: 'tech@test.com', password: 'tech123', first_name: 'Jane', last_name: 'Technician', role: 'technician' }
];

const prescriptions = [
  { id: 1, prescription_number: 'RX001', patient_name: 'John Doe', medication_name: 'Amoxicillin', status: 'filled', dosage: '500mg', frequency: 'Twice daily' },
  { id: 2, prescription_number: 'RX002', patient_name: 'Mary Smith', medication_name: 'Lisinopril', status: 'pending', dosage: '10mg', frequency: 'Once daily' },
  { id: 3, prescription_number: 'RX003', patient_name: 'James Wilson', medication_name: 'Metformin', status: 'pending', dosage: '500mg', frequency: 'Twice daily' }
];

const inventory = [
  { id: 1, medication_name: 'Amoxicillin', quantity_on_hand: 15, reorder_level: 20, batch_number: 'B001', expiry_date: '2024-12-31' },
  { id: 2, medication_name: 'Lisinopril', quantity_on_hand: 8, reorder_level: 25, batch_number: 'B002', expiry_date: '2024-10-15' },
  { id: 3, medication_name: 'Metformin', quantity_on_hand: 12, reorder_level: 30, batch_number: 'B003', expiry_date: '2024-11-30' }
];

const patients = [
  { id: 1, national_id: 'NAT001', first_name: 'John', last_name: 'Doe', phone: '555-0101', blood_type: 'O+', allergies: ['Penicillin'] },
  { id: 2, national_id: 'NAT002', first_name: 'Mary', last_name: 'Smith', phone: '555-0202', blood_type: 'A+', allergies: ['Sulfa'] },
  { id: 3, national_id: 'NAT003', first_name: 'James', last_name: 'Wilson', phone: '555-0303', blood_type: 'B+', allergies: [] }
];

// Simple token generation
function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString('base64');
}

// Parse body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { 
        resolve(body ? JSON.parse(body) : {}); 
      } catch (error) { 
        reject(error); 
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  try {
    // Health check
    if (path === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Login
    if (path === '/api/v1/auth/login' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        console.log('Login attempt:', body);
        
        const user = users.find(u => u.email === body.email && u.password === body.password);
        
        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        const token = generateToken(user);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          token, 
          user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role }
        }));
        return;
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
        return;
      }
    }

    // Register (fixed)
    if (path === '/api/v1/auth/register' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        console.log('Registration attempt:', body);
        
        // Check for existing user
        const existingUser = users.find(u => u.email === body.email);
        if (existingUser) {
          res.writeHead(409);
          res.end(JSON.stringify({ error: 'Email already registered' }));
          return;
        }
        
        // Validation
        if (!body.email || !body.password || !body.first_name || !body.last_name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'All required fields must be provided' }));
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid email format' }));
          return;
        }

        // Create new user
        const newUser = {
          id: users.length + 1,
          email: body.email,
          password: body.password,
          first_name: body.first_name,
          last_name: body.last_name,
          role: body.role || 'technician'
        };

        users.push(newUser);
        const token = generateToken(newUser);

        console.log('New user created:', newUser);

        res.writeHead(201);
        res.end(JSON.stringify({ 
          token, 
          user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, role: newUser.role }
        }));
        return;
      } catch (error) {
        console.error('Registration error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Registration failed: ' + error.message }));
        return;
      }
    }

    // Simple auth check
    const authHeader = req.headers.authorization;
    let currentUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        currentUser = users.find(u => u.id === decoded.id);
      } catch (error) {
        console.error('Auth error:', error);
      }
    }

    if (!currentUser && (path.startsWith('/api/v1/') && path !== '/api/v1/auth/login' && path !== '/api/v1/auth/register')) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    // User profile
    if (path === '/api/v1/users/profile' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        id: currentUser.id,
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        role: currentUser.role
      }));
      return;
    }

    // Prescriptions
    if (path === '/api/v1/prescriptions' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(prescriptions));
      return;
    }

    // Inventory
    if (path === '/api/v1/inventory' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(inventory));
      return;
    }

    // Low stock
    if (path === '/api/v1/inventory/low-stock' && req.method === 'GET') {
      const lowStock = inventory.filter(item => item.quantity_on_hand <= item.reorder_level);
      res.writeHead(200);
      res.end(JSON.stringify(lowStock));
      return;
    }

    // Patients
    if (path === '/api/v1/patients' && req.method === 'GET') {
      const search = parsedUrl.query.search || '';
      let filtered = patients;
      
      if (search) {
        filtered = patients.filter(p => 
          p.first_name.toLowerCase().includes(search.toLowerCase()) ||
          p.last_name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.writeHead(200);
      res.end(JSON.stringify(filtered));
      return;
    }

    // Analytics
    if (path === '/api/v1/analytics/overview' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        totalPrescriptions: prescriptions.length,
        filledPrescriptions: prescriptions.filter(p => p.status === 'filled').length,
        totalInventory: inventory.length,
        lowStockCount: inventory.filter(i => i.quantity_on_hand <= i.reorder_level).length,
        totalPatients: patients.length
      }));
      return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error: ' + error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 FIXED PHARMACY SERVER STARTED`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`\n👤 LOGIN CREDENTIALS:`);
  console.log(`   Admin: admin@test.com / admin123`);
  console.log(`   Pharmacist: pharmacist@test.com / pharm123`);
  console.log(`   Technician: tech@test.com / tech123`);
  console.log(`\n✅ Registration now working!`);
  console.log(`✨ Ready for frontend connections!\n`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
