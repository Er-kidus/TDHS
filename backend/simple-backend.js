const http = require('http');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Log every incoming request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request - allowing');
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/v1/pharmacies' && req.method === 'GET') {
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
    res.writeHead(200);
    res.end(JSON.stringify(pharmacies));
    return;
  }

  // Login endpoint
  if (req.url === '/api/v1/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        // Mock authentication - accepts any valid email/password
        if (data.email && data.password) {
          const token = 'mock-jwt-token-' + Date.now();
          const user = {
            id: '1',
            email: data.email,
            first_name: 'John',
            last_name: 'Doe',
            role: 'pharmacist',
            pharmacy_id: '1'
          };
          res.writeHead(200);
          res.end(JSON.stringify({ token, user }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Email and password required' }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Register endpoint
  if (req.url === '/api/v1/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = {
          id: '2',
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          pharmacy_id: data.pharmacy_id || '1'
        };
        const token = 'mock-jwt-token-67890';
        res.writeHead(200);
        res.end(JSON.stringify({ token, user }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // User profile endpoint
  if (req.url === '/api/v1/users/profile' && req.method === 'GET') {
    const user = {
      id: '1',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'pharmacist',
      pharmacy_id: '1'
    };
    res.writeHead(200);
    res.end(JSON.stringify(user));
    return;
  }

  // Prescriptions endpoint
  if (req.url === '/api/v1/prescriptions' && req.method === 'GET') {
    const prescriptions = [
      {
        id: '1',
        prescription_number: 'RX001',
        patient_id: 'P001',
        medication_id: 'M001',
        dosage: '10mg',
        frequency: 'Twice daily',
        date_prescribed: '2024-01-15T00:00:00Z',
        date_filled: '2024-01-15T10:30:00Z',
        status: 'filled',
        pharmacist_id: '1',
        notes: 'Take with food'
      },
      {
        id: '2',
        prescription_number: 'RX002',
        patient_id: 'P002',
        medication_id: 'M002',
        dosage: '5mg',
        frequency: 'Once daily',
        date_prescribed: '2024-01-16T00:00:00Z',
        date_filled: null,
        status: 'pending',
        pharmacist_id: null,
        notes: 'Take before breakfast'
      },
      {
        id: '3',
        prescription_number: 'RX003',
        patient_id: 'P003',
        medication_id: 'M003',
        dosage: '20mg',
        frequency: 'Three times daily',
        date_prescribed: '2024-01-17T00:00:00Z',
        date_filled: null,
        status: 'pending',
        pharmacist_id: null,
        notes: 'Complete full course'
      }
    ];
    res.writeHead(200);
    res.end(JSON.stringify(prescriptions));
    return;
  }

  // Inventory low stock endpoint
  if (req.url.startsWith('/api/v1/inventory/low-stock') && req.method === 'GET') {
    const lowStockItems = [
      {
        id: '1',
        medication_id: 'M001',
        pharmacy_id: '1',
        quantity_on_hand: 5,
        reorder_level: 20,
        unit_price: 15.99,
        last_updated: '2024-01-17T00:00:00Z'
      },
      {
        id: '2',
        medication_id: 'M004',
        pharmacy_id: '1',
        quantity_on_hand: 8,
        reorder_level: 25,
        unit_price: 22.50,
        last_updated: '2024-01-17T00:00:00Z'
      },
      {
        id: '3',
        medication_id: 'M007',
        pharmacy_id: '1',
        quantity_on_hand: 12,
        reorder_level: 30,
        unit_price: 8.75,
        last_updated: '2024-01-17T00:00:00Z'
      }
    ];
    res.writeHead(200);
    res.end(JSON.stringify(lowStockItems));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
