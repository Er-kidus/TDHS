const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

const { 
  pool, 
  query, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  logAudit,
  initializeDatabase,
  seedData
} = require('./database');

const { NotificationService, initializeNotificationTable } = require('./notification-service');

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Enhanced CORS and security headers
function setSecurityHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', NODE_ENV === 'production' ? 'https://yourdomain.com' : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', NODE_ENV === 'production' ? 'max-age=31536000; includeSubDomains' : '');
  res.setHeader('Content-Type', 'application/json');
}

// Rate limiting middleware
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

function rateLimit(req, res) {
  const clientIP = req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX) {
    res.writeHead(429);
    res.end(JSON.stringify({ 
      error: 'Too many requests',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    }));
    return false;
  }

  clientData.count++;
  return true;
}

// Enhanced authentication with role-based access
async function authenticate(req, res, requiredRoles = []) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized - No token provided' }));
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Invalid token' }));
      return null;
    }

    // Check if user is still active
    const userResult = await query(
      'SELECT id, email, role, pharmacy_id, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'User account not found or inactive' }));
      return null;
    }

    const user = userResult.rows[0];

    // Check role-based access
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Insufficient permissions' }));
      return null;
    }

    return { ...decoded, ...user };
  } catch (error) {
    console.error('Authentication error:', error);
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Authentication failed' }));
    return null;
  }
}

// Input validation with Joi-like validation
function validateInput(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }

    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }

  return errors;
}

// Parse request body with size limit
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        req.destroy();
        reject(new Error('Request entity too large'));
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}


// Initialize notification service
const notificationService = new NotificationService();

const server = http.createServer(async (req, res) => {
  // Enhanced logging
  const startTime = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.socket.remoteAddress}`);
  
  setSecurityHeaders(res);

  // Rate limiting
  if (!rateLimit(req, res)) {
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Enhanced health check with system status
    if (path === '/health' && method === 'GET') {
      const poolStatus = pool.totalCount > 0 ? 'connected' : 'disconnected';
      const connectedClients = notificationService.getConnectedClients().length;
      
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        database: poolStatus,
        version: '2.0.0',
        notifications: {
          service: 'active',
          connected_clients: connectedClients
        },
        uptime: process.uptime()
      }));
      return;
    }

    // System status endpoint
    if (path === '/api/v1/system/status' && method === 'GET') {
      const user = await authenticate(req, res, ['admin']);
      if (!user) return;

      const [userCount, prescriptionCount, inventoryCount, patientCount] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
        query('SELECT COUNT(*) as count FROM prescriptions'),
        query('SELECT COUNT(*) as count FROM inventory'),
        query('SELECT COUNT(*) as count FROM patients')
      ]);

      const systemStatus = {
        users: parseInt(userCount.rows[0].count),
        prescriptions: parseInt(prescriptionCount.rows[0].count),
        inventory_items: parseInt(inventoryCount.rows[0].count),
        patients: parseInt(patientCount.rows[0].count),
        connected_clients: notificationService.getConnectedClients().length,
        database_pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        }
      };

      res.writeHead(200);
      res.end(JSON.stringify(systemStatus));
      return;
    }

    // Enhanced login with comprehensive validation
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      
      const validationErrors = validateInput(body, {
        email: { required: true, type: 'string', email: true },
        password: { required: true, type: 'string', minLength: 8 }
      });

      if (validationErrors.length > 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Validation failed', details: validationErrors }));
        return;
      }

      const result = await query(
        'SELECT id, email, password_hash, first_name, last_name, role, pharmacy_id, last_login FROM users WHERE email = $1 AND is_active = true',
        [body.email]
      );

      if (result.rows.length === 0) {
        await logAudit(null, 'LOGIN_FAILED', 'users', null, null, { email: body.email }, req);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const user = result.rows[0];
      const isValidPassword = await verifyPassword(body.password, user.password_hash);

      if (!isValidPassword) {
        await logAudit(user.id, 'LOGIN_FAILED', 'users', user.id, null, { email: body.email }, req);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      // Update last login
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const token = generateToken(user);
      
      await logAudit(user.id, 'LOGIN_SUCCESS', 'users', user.id, null, { login_time: new Date().toISOString() }, req);

      res.writeHead(200);
      res.end(JSON.stringify({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          pharmacy_id: user.pharmacy_id,
          last_login: user.last_login
        }
      }));
      return;
    }

    // Enhanced registration with validation
    if (path === '/api/v1/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      
      const validationErrors = validateInput(body, {
        email: { required: true, type: 'string', email: true },
        password: { required: true, type: 'string', minLength: 8 },
        first_name: { required: true, type: 'string', minLength: 2 },
        last_name: { required: true, type: 'string', minLength: 2 },
        role: { required: true, type: 'string', pattern: /^(admin|pharmacist|technician|doctor)$/ }
      });

      if (validationErrors.length > 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Validation failed', details: validationErrors }));
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

      await logAudit(user.id, 'REGISTER', 'users', user.id, null, { registration_time: new Date().toISOString() }, req);

      // Send notification to admins
      await notificationService.broadcastToRole('admin', {
        type: 'new_user',
        title: 'New User Registration',
        message: `${user.first_name} ${user.last_name} has registered as ${user.role}`,
        data: user
      });

      res.writeHead(201);
      res.end(JSON.stringify({ token, user }));
      return;
    }

    // Protected routes with enhanced authentication
    const user = await authenticate(req, res);
    if (!user) return;

    // Enhanced prescription creation with validation and notifications
    if (path === '/api/v1/prescriptions' && method === 'POST') {
      const body = await parseBody(req);
      
      const validationErrors = validateInput(body, {
        patient_id: { required: true, type: 'number' },
        medication_id: { required: true, type: 'number' },
        dosage: { required: true, type: 'string', minLength: 1 },
        frequency: { required: true, type: 'string', minLength: 1 },
        quantity: { required: true, type: 'number', min: 1 }
      });

      if (validationErrors.length > 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Validation failed', details: validationErrors }));
        return;
      }

      // Check if patient exists
      const patientCheck = await query('SELECT first_name, last_name FROM patients WHERE id = $1', [body.patient_id]);
      if (patientCheck.rows.length === 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Patient not found' }));
        return;
      }

      // Check if medication exists
      const medicationCheck = await query('SELECT name FROM medications WHERE id = $1', [body.medication_id]);
      if (medicationCheck.rows.length === 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Medication not found' }));
        return;
      }

      const prescriptionNumber = 'RX' + Date.now();
      const qrHash = require('crypto').createHash('sha256').update(prescriptionNumber).digest('hex');

      const result = await query(
        `INSERT INTO prescriptions (prescription_number, patient_id, medication_id, prescriber_id, 
         dosage, frequency, duration, quantity, instructions, qr_code_hash, pharmacy_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [prescriptionNumber, body.patient_id, body.medication_id, user.id, 
         body.dosage, body.frequency, body.duration, body.quantity, 
         body.instructions, qrHash, user.pharmacy_id]
      );

      await logAudit(user.id, 'CREATE_PRESCRIPTION', 'prescriptions', result.rows[0].id, null, result.rows[0], req);

      // Send real-time notification
      await notificationService.notifyNewPrescription(user.pharmacy_id, {
        id: result.rows[0].id,
        prescriptionNumber,
        patientName: `${patientCheck.rows[0].first_name} ${patientCheck.rows[0].last_name}`,
        medicationName: medicationCheck.rows[0].name,
        prescriber: `${user.first_name} ${user.last_name}`
      });

      res.writeHead(201);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Enhanced inventory update with low stock notifications
    if (path.startsWith('/api/v1/inventory/') && method === 'PUT') {
      const inventoryId = parseInt(path.split('/')[4]);
      const body = await parseBody(req);

      if (!body.quantity_on_hand || body.quantity_on_hand < 0) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Valid quantity_on_hand is required' }));
        return;
      }

      const oldResult = await query('SELECT * FROM inventory WHERE id = $1', [inventoryId]);
      if (oldResult.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Inventory item not found' }));
        return;
      }

      const result = await query(
        'UPDATE inventory SET quantity_on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [inventoryId, body.quantity_on_hand]
      );

      await logAudit(user.id, 'UPDATE_INVENTORY', 'inventory', inventoryId, oldResult.rows[0], result.rows[0], req);

      // Check for low stock and send notification
      const updatedItem = result.rows[0];
      if (updatedItem.quantity_on_hand <= updatedItem.reorder_level) {
        const medicationResult = await query('SELECT name FROM medications WHERE id = $1', [updatedItem.medication_id]);
        
        await notificationService.notifyLowStock(
          user.pharmacy_id,
          medicationResult.rows[0].name,
          updatedItem.quantity_on_hand,
          updatedItem.reorder_level
        );
      }

      res.writeHead(200);
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    // Get user notifications
    if (path === '/api/v1/notifications' && method === 'GET') {
      const result = await query(
        `SELECT id, type, title, message, data, is_read, created_at 
         FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [user.id]
      );

      res.writeHead(200);
      res.end(JSON.stringify(result.rows));
      return;
    }

    // Mark notification as read
    if (path.startsWith('/api/v1/notifications/') && method === 'PUT') {
      const notificationId = parseInt(path.split('/')[4]);
      
      await query(
        'UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
        [notificationId, user.id]
      );

      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Notification marked as read' }));
      return;
    }

    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  } finally {
    // Log request completion time
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  }
});

// Initialize everything and start server
async function startServer() {
  try {
    console.log('Initializing enhanced pharmacy management system...');
    
    // Initialize database
    await initializeDatabase();
    await seedData();
    await initializeNotificationTable();
    
    // Initialize WebSocket notification service
    notificationService.initialize(server);
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Enhanced Pharmacy Management System v2.0.0`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 System status: http://localhost:${PORT}/api/v1/system/status`);
      console.log(`🔐 Environment: ${NODE_ENV}`);
      console.log(`🗄️  Database: PostgreSQL with real persistence`);
      console.log(`🔔 Notifications: WebSocket real-time service active`);
      console.log(`🛡️  Security: Enhanced with rate limiting and audit logging`);
      console.log(`✨ Features: All endpoints implemented with validation`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed');
    
    if (notificationService.wss) {
      notificationService.wss.close(() => {
        console.log('WebSocket server closed');
      });
    }
    
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.emit('SIGTERM');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
