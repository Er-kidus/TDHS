const http = require('http');

// Test all endpoints that should be working
const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runAllTests() {
  console.log('=== TESTING BACKEND SERVER ===\n');

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/health');
    console.log(`   Status: ${health.status} - ${health.success ? 'PASS' : 'FAIL'}`);
    if (health.success) console.log(`   Response: ${JSON.stringify(health.data)}`);

    // Test 2: Pharmacies endpoint
    console.log('\n2. Testing pharmacies endpoint...');
    const pharmacies = await testEndpoint('/api/v1/pharmacies');
    console.log(`   Status: ${pharmacies.status} - ${pharmacies.success ? 'PASS' : 'FAIL'}`);
    if (pharmacies.success) console.log(`   Found ${pharmacies.data.length} pharmacies`);

    // Test 3: Login endpoint
    console.log('\n3. Testing login endpoint...');
    const loginData = { email: 'test@example.com', password: 'test123' };
    const login = await testEndpoint('/api/v1/auth/login', 'POST', loginData);
    console.log(`   Status: ${login.status} - ${login.success ? 'PASS' : 'FAIL'}`);
    if (login.success) console.log(`   Token received: ${login.data.token ? 'YES' : 'NO'}`);

    // Test 4: User profile endpoint
    console.log('\n4. Testing user profile endpoint...');
    const profile = await testEndpoint('/api/v1/users/profile');
    console.log(`   Status: ${profile.status} - ${profile.success ? 'PASS' : 'FAIL'}`);
    if (profile.success) console.log(`   User: ${profile.data.first_name} ${profile.data.last_name}`);

    // Test 5: Prescriptions endpoint
    console.log('\n5. Testing prescriptions endpoint...');
    const prescriptions = await testEndpoint('/api/v1/prescriptions');
    console.log(`   Status: ${prescriptions.status} - ${prescriptions.success ? 'PASS' : 'FAIL'}`);
    if (prescriptions.success) console.log(`   Found ${prescriptions.data.length} prescriptions`);

    // Test 6: Inventory low stock endpoint
    console.log('\n6. Testing inventory low stock endpoint...');
    const inventory = await testEndpoint('/api/v1/inventory/low-stock?pharmacy_id=1');
    console.log(`   Status: ${inventory.status} - ${inventory.success ? 'PASS' : 'FAIL'}`);
    if (inventory.success) console.log(`   Found ${inventory.data.length} low stock items`);

    // Summary
    const allTests = [health, pharmacies, login, profile, prescriptions, inventory];
    const passedTests = allTests.filter(test => test.success).length;
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Passed: ${passedTests}/6 tests`);
    console.log(`Backend is ${passedTests === 6 ? 'FULLY FUNCTIONAL' : 'PARTIALLY FUNCTIONAL'}`);
    
    if (passedTests === 6) {
      console.log('\nAll endpoints working! Your pharmacy system should be fully functional.');
    } else {
      console.log('\nSome endpoints failed. Check the backend server.');
    }

  } catch (error) {
    console.error('Test failed completely:', error.message);
    console.log('Backend server is not running or not accessible.');
  }
}

runAllTests();
