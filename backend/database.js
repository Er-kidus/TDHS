const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pharmacy_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'pharmacist', 'technician', 'doctor')),
        pharmacy_id INTEGER REFERENCES pharmacies(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create pharmacies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pharmacies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        national_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address TEXT,
        blood_type VARCHAR(10),
        allergies TEXT[],
        chronic_conditions TEXT[],
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relationship VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create medications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        generic_name VARCHAR(255),
        ndc_code VARCHAR(20) UNIQUE,
        category VARCHAR(100),
        manufacturer VARCHAR(255),
        strength VARCHAR(50),
        form VARCHAR(50),
        is_controlled_substance BOOLEAN DEFAULT false,
        schedule INTEGER CHECK (schedule BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        pharmacy_id INTEGER REFERENCES pharmacies(id),
        medication_id INTEGER REFERENCES medications(id),
        batch_number VARCHAR(100),
        expiry_date DATE,
        quantity_on_hand INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER DEFAULT 20,
        unit_cost DECIMAL(10,2),
        unit_price DECIMAL(10,2),
        storage_location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pharmacy_id, medication_id, batch_number)
      )
    `);

    // Create prescriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        prescription_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id INTEGER REFERENCES patients(id),
        medication_id INTEGER REFERENCES medications(id),
        prescriber_id INTEGER REFERENCES users(id),
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration INTEGER,
        quantity INTEGER NOT NULL,
        instructions TEXT,
        date_prescribed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_filled TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'expired')),
        pharmacist_id INTEGER REFERENCES users(id),
        qr_code_hash VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sales table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        prescription_id INTEGER REFERENCES prescriptions(id),
        pharmacy_id INTEGER REFERENCES pharmacies(id),
        patient_id INTEGER REFERENCES patients(id),
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'paid',
        pharmacist_id INTEGER REFERENCES users(id),
        date_sold TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Seed initial data
async function seedData() {
  try {
    // Check if pharmacies exist
    const pharmacyCount = await pool.query('SELECT COUNT(*) FROM pharmacies');
    if (parseInt(pharmacyCount.rows[0].count) === 0) {
      // Insert sample pharmacies
      await pool.query(`
        INSERT INTO pharmacies (name, license_number, address, phone, email) VALUES
        ('Central Pharmacy', 'PH-001', '123 Main St, City, State 12345', '555-0123', 'central@pharmacy.com'),
        ('East Side Pharmacy', 'PH-002', '456 Oak Ave, City, State 12345', '555-0456', 'east@pharmacy.com'),
        ('West End Pharmacy', 'PH-003', '789 Pine Rd, City, State 12345', '555-0789', 'west@pharmacy.com')
      `);
    }

    // Check if medications exist
    const medicationCount = await pool.query('SELECT COUNT(*) FROM medications');
    if (parseInt(medicationCount.rows[0].count) === 0) {
      // Insert sample medications
      await pool.query(`
        INSERT INTO medications (name, generic_name, ndc_code, category, manufacturer, strength, form, is_controlled_substance, schedule) VALUES
        ('Amoxicillin', 'Amoxicillin', '12345-678-90', 'Antibiotic', 'Generic Co', '500mg', 'Capsule', false, null),
        ('Lisinopril', 'Lisinopril', '23456-789-01', 'ACE Inhibitor', 'Generic Co', '10mg', 'Tablet', false, null),
        ('Metformin', 'Metformin', '34567-890-12', 'Antidiabetic', 'Generic Co', '500mg', 'Tablet', false, null),
        ('Atorvastatin', 'Atorvastatin', '45678-901-23', 'Statin', 'Generic Co', '20mg', 'Tablet', false, null),
        ('Omeprazole', 'Omeprazole', '56789-012-34', 'PPI', 'Generic Co', '20mg', 'Capsule', false, null),
        ('Oxycodone', 'Oxycodone', '67890-123-45', 'Opioid', 'Generic Co', '5mg', 'Tablet', true, 2)
      `);
    }

    // Check if users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Insert sample users
      await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, pharmacy_id) VALUES
        ('admin@pharmacy.test', $1, 'Admin', 'User', 'admin', 1),
        ('pharmacist@pharmacy.test', $1, 'John', 'Pharmacist', 'pharmacist', 1),
        ('tech@pharmacy.test', $1, 'Jane', 'Technician', 'technician', 1),
        ('doctor@pharmacy.test', $1, 'Dr. Smith', 'Doctor', 'doctor', 1)
      `, [hashedPassword]);
    }

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Authentication functions
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      pharmacy_id: user.pharmacy_id 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Audit logging
async function logAudit(userId, action, tableName, recordId, oldValues, newValues, ipAddress, userAgent) {
  try {
    await pool.query(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [userId, action, tableName, recordId, oldValues, newValues, ipAddress, userAgent]);
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

// Database helper functions
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

// Initialize database on module load
initializeDatabase().then(() => {
  seedData().catch(console.error);
}).catch(console.error);

module.exports = {
  pool,
  query,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  logAudit,
  initializeDatabase,
  seedData
};
