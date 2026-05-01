const http = require('http');

const PORT = 8081;

// Mock data
const pharmacies = [
  {
    id: '1',
    name: 'Central Pharmacy',
    license_number: 'PH-001',
    address: '123 Main St, City, State',
    phone: '555-0123',
    email: 'central@pharmacy.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2', 
    name: 'East Side Pharmacy',
    license_number: 'PH-002',
    address: '456 Oak Ave, City, State',
    phone: '555-0456',
    email: 'east@pharmacy.com',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z'
  }
];

// Enable CORS
const enableCORS = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
};

// Routes
const server = http.createServer(async (req, res) => {
  enableCORS(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json');

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Pharmacies endpoint
  if (req.url === '/api/v1/pharmacies' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ pharmacies }));
    return;
  }

  // Login endpoint
  if (req.url === '/api/v1/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const token = 'mock-jwt-token-12345';
    const user = {
      id: '1',
      email: body.email || 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'pharmacist',
      pharmacy_id: '1',
    };
    res.writeHead(200);
    res.end(JSON.stringify({ token, user }));
    return;
  }

  // Register endpoint
  if (req.url === '/api/v1/auth/register' && req.method === 'POST') {
    const body = await parseBody(req);
    const user = {
      id: '2',
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      role: body.role,
      pharmacy_id: '1',
    };
    const token = 'mock-jwt-token-67890';
    res.writeHead(200);
    res.end(JSON.stringify({ token, user }));
    return;
  }

  // Prescriptions endpoint
  if (req.url === '/api/v1/prescriptions' && req.method === 'GET') {
    const prescriptions = [
      {
        id: '1',
        prescription_number: 'RX-001',
        patient_id: '1',
        doctor_id: '1',
        pharmacy_id: '1',
        date_prescribed: '2024-01-15T00:00:00Z',
        status: 'pending',
        notes: 'Take as needed',
        created_at: '2024-01-15T00:00:00Z',
      },
    ];
    res.writeHead(200);
    res.end(JSON.stringify({ prescriptions }));
    return;
  }

  // Inventory endpoint
  if (req.url === '/api/v1/inventory' && req.method === 'GET') {
    const inventory = [
      {
        id: '1',
        pharmacy_id: '1',
        medication_id: '1',
        quantity_on_hand: 100,
        reorder_level: 20,
        unit_cost: 5.99,
        selling_price: 9.99,
        expiry_date: '2025-12-31',
        batch_number: 'BATCH-001',
        supplier: 'Medical Supply Co',
        last_updated: '2024-01-15T00:00:00Z',
      },
    ];
    res.writeHead(200);
    res.end(JSON.stringify({ inventory }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Pharmacy Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/v1`);
});
