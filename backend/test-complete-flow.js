const http = require('http');

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Health check:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

// Test pharmacies endpoint
const testPharmacies = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/pharmacies',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Pharmacies:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

// Test login endpoint
const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'test123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Login:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Test registration endpoint
const testRegister = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'newuser@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'pharmacist',
      pharmacy_id: '1'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Register:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run all tests
async function runTests() {
  console.log('Testing backend endpoints...\n');
  
  try {
    const health = await testHealth();
    const pharmacies = await testPharmacies();
    const login = await testLogin();
    const register = await testRegister();
    
    console.log('\nTest Results:');
    console.log('Health:', health ? 'PASS' : 'FAIL');
    console.log('Pharmacies:', pharmacies ? 'PASS' : 'FAIL');
    console.log('Login:', login ? 'PASS' : 'FAIL');
    console.log('Register:', register ? 'PASS' : 'FAIL');
    
    if (health && pharmacies && login && register) {
      console.log('\nAll endpoints working! Backend is ready.');
    } else {
      console.log('\nSome endpoints failed. Check backend server.');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Backend server is not running or not accessible.');
  }
}

runTests();
