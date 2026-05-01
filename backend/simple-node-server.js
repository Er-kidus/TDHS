const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mock pharmacies data
app.get('/api/v1/pharmacies', (req, res) => {
  const pharmacies = [
    {
      id: '1',
      name: 'Central Pharmacy',
      license_number: 'PH-001',
      address: '123 Main St, City, State',
      phone: '555-0123',
      email: 'central@pharmacy.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2', 
      name: 'East Side Pharmacy',
      license_number: 'PH-002',
      address: '456 Oak Ave, City, State',
      phone: '555-0456',
      email: 'east@pharmacy.com',
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
    },
  ];
  res.json({ pharmacies });
});

// Mock authentication endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Simple mock authentication (accept any email/password)
  const token = 'mock-jwt-token-12345';
  const user = {
    id: '1',
    email: email,
    first_name: 'John',
    last_name: 'Doe',
    role: 'pharmacist',
    pharmacy_id: '1',
  };

  res.json({
    token,
    user,
  });
});

// Mock registration endpoint
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  
  if (!email || !password || !first_name || !last_name || !role) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Mock user creation
  const user = {
    id: '2',
    email: email,
    first_name: first_name,
    last_name: last_name,
    role: role,
    pharmacy_id: '1',
  };

  const token = 'mock-jwt-token-67890';
  res.json({
    token,
    user,
  });
});

// Mock prescriptions endpoint
app.get('/api/v1/prescriptions', (req, res) => {
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
  res.json({ prescriptions });
});

// Mock inventory endpoint
app.get('/api/v1/inventory', (req, res) => {
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
  res.json({ inventory });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Pharmacy Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/v1`);
});
