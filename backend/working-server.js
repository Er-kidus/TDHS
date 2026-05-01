const http = require('http');
const url = require('url');
const crypto = require('crypto');

const PORT = 8080;

// In-memory database simulation
let users = [
  {
    id: 1,
    email: 'admin@pharmacy.test',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    pharmacy_id: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'pharmacist@pharmacy.test',
    password: 'pharm123',
    first_name: 'John',
    last_name: 'Pharmacist',
    role: 'pharmacist',
    pharmacy_id: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'tech@pharmacy.test',
    password: 'tech123',
    first_name: 'Jane',
    last_name: 'Technician',
    role: 'technician',
    pharmacy_id: 1,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

let prescriptions = [
  {
    id: 1,
    prescription_number: 'RX001',
    patient_id: 1,
    medication_id: 1,
    prescriber_id: 1,
    dosage: '10mg',
    frequency: 'Twice daily',
    duration: 7,
    quantity: 14,
    instructions: 'Take with food',
    date_prescribed: '2024-01-15T10:00:00Z',
    date_filled: '2024-01-15T14:30:00Z',
    status: 'filled',
    pharmacist_id: 2,
    qr_code_hash: 'abc123',
    notes: 'Patient reported mild nausea'
  },
  {
    id: 2,
    prescription_number: 'RX002',
    patient_id: 2,
    medication_id: 2,
    prescriber_id: 1,
    dosage: '5mg',
    frequency: 'Once daily',
    duration: 14,
    quantity: 14,
    instructions: 'Take before breakfast',
    date_prescribed: '2024-01-16T09:00:00Z',
    date_filled: null,
    status: 'pending',
    pharmacist_id: null,
    qr_code_hash: 'def456',
    notes: null
  },
  {
    id: 3,
    prescription_number: 'RX003',
    patient_id: 3,
    medication_id: 3,
    prescriber_id: 1,
    dosage: '20mg',
    frequency: 'Three times daily',
    duration: 10,
    quantity: 30,
    instructions: 'Complete full course',
    date_prescribed: '2024-01-17T11:00:00Z',
    date_filled: null,
    status: 'pending',
    pharmacist_id: null,
    qr_code_hash: 'ghi789',
    notes: 'Follow up in 2 weeks'
  }
];

let inventory = [
  {
    id: 1,
    pharmacy_id: 1,
    medication_id: 1,
    batch_number: 'B001',
    expiry_date: '2024-12-31',
    quantity_on_hand: 15,
    reorder_level: 20,
    unit_cost: 10.50,
    unit_price: 15.99,
    storage_location: 'A1-B2'
  },
  {
    id: 2,
    pharmacy_id: 1,
    medication_id: 2,
    batch_number: 'B002',
    expiry_date: '2024-10-15',
    quantity_on_hand: 8,
    reorder_level: 25,
    unit_cost: 12.00,
    unit_price: 18.50,
    storage_location: 'A1-C3'
  },
  {
    id: 3,
    pharmacy_id: 1,
    medication_id: 3,
    batch_number: 'B003',
    expiry_date: '2024-11-30',
    quantity_on_hand: 12,
    reorder_level: 30,
    unit_cost: 8.75,
    unit_price: 13.99,
    storage_location: 'B2-D1'
  }
];

let medications = [
  {
    id: 1,
    name: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    ndc_code: '12345-678-90',
    category: 'Antibiotic',
    manufacturer: 'Generic Co',
    strength: '500mg',
    form: 'Capsule',
    is_controlled_substance: false,
    schedule: null
  },
  {
    id: 2,
    name: 'Lisinopril',
    generic_name: 'Lisinopril',
    ndc_code: '23456-789-01',
    category: 'ACE Inhibitor',
    manufacturer: 'Generic Co',
    strength: '10mg',
    form: 'Tablet',
    is_controlled_substance: false,
    schedule: null
  },
  {
    id: 3,
    name: 'Metformin',
    generic_name: 'Metformin',
    ndc_code: '34567-890-12',
    category: 'Antidiabetic',
    manufacturer: 'Generic Co',
    strength: '500mg',
    form: 'Tablet',
    is_controlled_substance: false,
    schedule: null
  }
];

let patients = [
  {
    id: 1,
    national_id: 'NAT001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1980-05-15',
    phone: '555-0101',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State 12345',
    blood_type: 'O+',
    allergies: ['Penicillin', 'Pollen'],
    chronic_conditions: ['Hypertension', 'Diabetes Type 2'],
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '555-0102',
    emergency_contact_relationship: 'Spouse'
  },
  {
    id: 2,
    national_id: 'NAT002',
    first_name: 'Mary',
    last_name: 'Smith',
    date_of_birth: '1975-08-22',
    phone: '555-0202',
    email: 'mary.smith@email.com',
    address: '456 Oak Ave, City, State 12345',
    blood_type: 'A+',
    allergies: ['Sulfa drugs'],
    chronic_conditions: ['Asthma'],
    emergency_contact_name: 'Robert Smith',
    emergency_contact_phone: '555-0203',
    emergency_contact_relationship: 'Husband'
  },
  {
    id: 3,
    national_id: 'NAT003',
    first_name: 'James',
    last_name: 'Wilson',
    date_of_birth: '1990-03-10',
    phone: '555-0303',
    email: 'james.wilson@email.com',
    address: '789 Pine Rd, City, State 12345',
    blood_type: 'B+',
    allergies: [],
    chronic_conditions: [],
    emergency_contact_name: 'Linda Wilson',
    emergency_contact_phone: '555-0304',
    emergency_contact_relationship: 'Mother'
  }
];

// JWT token generation (simplified)
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    pharmacy_id: user.pharmacy_id,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// JWT token verification (simplified)
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

// Authentication middleware
function authenticate(req, res) {
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
        database: 'in-memory-simulation',
        version: '2.0.0-working'
      }));
      return;
    }

    // Login endpoint
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      
      if (!body.email || !body.password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      const user = users.find(u => u.email === body.email && u.password === body.password && u.is_active);
      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }

      const token = generateToken(user);
      
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

    // Protected routes (require authentication)
    const user = authenticate(req, res);
    if (!user) return;

    // User profile
    if (path === '/api/v1/users/profile' && method === 'GET') {
      const userProfile = users.find(u => u.id === user.id);
      if (!userProfile) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        id: userProfile.id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        role: userProfile.role,
        pharmacy_id: userProfile.pharmacy_id
      }));
      return;
    }

    // Prescriptions
    if (path === '/api/v1/prescriptions' && method === 'GET') {
      // Add patient and medication names
      const enrichedPrescriptions = prescriptions.map(p => {
        const patient = patients.find(pa => pa.id === p.patient_id);
        const medication = medications.find(m => m.id === p.medication_id);
        const prescriber = users.find(u => u.id === p.prescriber_id);
        
        return {
          ...p,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
          medication_name: medication ? medication.name : 'Unknown',
          prescriber_name: prescriber ? `${prescriber.first_name} ${prescriber.last_name}` : 'Unknown'
        };
      });

      res.writeHead(200);
      res.end(JSON.stringify(enrichedPrescriptions));
      return;
    }

    // Update prescription status
    if (path.startsWith('/api/v1/prescriptions/') && method === 'PUT') {
      const prescriptionId = parseInt(path.split('/')[4]);
      const body = await parseBody(req);

      if (!body.status) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Status is required' }));
        return;
      }

      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Prescription not found' }));
        return;
      }

      // Update prescription
      prescription.status = body.status;
      if (body.status === 'filled') {
        prescription.date_filled = new Date().toISOString();
        prescription.pharmacist_id = user.id;
      }

      res.writeHead(200);
      res.end(JSON.stringify(prescription));
      return;
    }

    // Inventory
    if (path === '/api/v1/inventory' && method === 'GET') {
      // Add medication names
      const enrichedInventory = inventory.map(i => {
        const medication = medications.find(m => m.id === i.medication_id);
        return {
          ...i,
          medication_name: medication ? medication.name : 'Unknown',
          generic_name: medication ? medication.generic_name : 'Unknown',
          category: medication ? medication.category : 'Unknown'
        };
      });

      res.writeHead(200);
      res.end(JSON.stringify(enrichedInventory));
      return;
    }

    // Low stock inventory
    if (path.startsWith('/api/v1/inventory/low-stock') && method === 'GET') {
      const lowStockItems = inventory.filter(i => i.quantity_on_hand <= i.reorder_level);
      
      // Add medication names
      const enrichedLowStock = lowStockItems.map(i => {
        const medication = medications.find(m => m.id === i.medication_id);
        return {
          ...i,
          medication_name: medication ? medication.name : 'Unknown',
          generic_name: medication ? medication.generic_name : 'Unknown',
          category: medication ? medication.category : 'Unknown'
        };
      });

      res.writeHead(200);
      res.end(JSON.stringify(enrichedLowStock));
      return;
    }

    // Update inventory
    if (path.startsWith('/api/v1/inventory/') && method === 'PUT') {
      const inventoryId = parseInt(path.split('/')[4]);
      const body = await parseBody(req);

      if (!body.quantity_on_hand) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Quantity on hand is required' }));
        return;
      }

      const inventoryItem = inventory.find(i => i.id === inventoryId);
      if (!inventoryItem) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Inventory item not found' }));
        return;
      }

      inventoryItem.quantity_on_hand = body.quantity_on_hand;

      res.writeHead(200);
      res.end(JSON.stringify(inventoryItem));
      return;
    }

    // Patients
    if (path === '/api/v1/patients' && method === 'GET') {
      const search = parsedUrl.query.search || '';
      let filteredPatients = patients;

      if (search) {
        filteredPatients = patients.filter(p => 
          p.first_name.toLowerCase().includes(search.toLowerCase()) ||
          p.last_name.toLowerCase().includes(search.toLowerCase()) ||
          p.national_id.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.writeHead(200);
      res.end(JSON.stringify(filteredPatients));
      return;
    }

    // Medications
    if (path === '/api/v1/medications' && method === 'GET') {
      const search = parsedUrl.query.search || '';
      let filteredMedications = medications;

      if (search) {
        filteredMedications = medications.filter(m => 
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.generic_name && m.generic_name.toLowerCase().includes(search.toLowerCase())) ||
          (m.ndc_code && m.ndc_code.toLowerCase().includes(search.toLowerCase()))
        );
      }

      res.writeHead(200);
      res.end(JSON.stringify(filteredMedications));
      return;
    }

    // Analytics data
    if (path === '/api/v1/analytics/overview' && method === 'GET') {
      const analytics = {
        totalPrescriptions: prescriptions.length,
        filledPrescriptions: prescriptions.filter(p => p.status === 'filled').length,
        totalInventory: inventory.length,
        lowStockCount: inventory.filter(i => i.quantity_on_hand <= i.reorder_level).length,
        totalPatients: patients.length
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
  console.log(`🚀 Working Pharmacy Management System Backend`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: In-memory simulation (no PostgreSQL required)`);
  console.log(`✨ Features: All endpoints implemented with real data`);
  console.log(`👤 Test Users:`);
  console.log(`   Admin: admin@pharmacy.test / admin123`);
  console.log(`   Pharmacist: pharmacist@pharmacy.test / pharm123`);
  console.log(`   Technician: tech@pharmacy.test / tech123`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.emit('SIGTERM');
});
