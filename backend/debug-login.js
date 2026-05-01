const http = require('http');

// Test login endpoint with detailed logging
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
    
    console.log('Testing login endpoint...');
    console.log('Request data:', postData);
    
    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        console.log('Received chunk:', chunk.toString());
      });
      
      res.on('end', () => {
        console.log('Complete response:', data);
        try {
          const parsed = JSON.parse(data);
          console.log('Parsed response:', parsed);
          resolve({ success: res.statusCode === 200, data: parsed });
        } catch (e) {
          console.log('Failed to parse JSON:', e.message);
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Test if backend is running
const testBackend = () => {
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
        console.log('Health check response:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (error) => {
      console.error('Health check error:', error.message);
      reject(error);
    });
    
    req.end();
  });
};

async function debugLogin() {
  try {
    console.log('=== DEBUGGING LOGIN ISSUE ===\n');
    
    // First check if backend is running
    console.log('1. Checking if backend is running...');
    const backendRunning = await testBackend();
    
    if (!backendRunning) {
      console.log('Backend is not running!');
      return;
    }
    
    console.log('Backend is running.\n');
    
    // Test login endpoint
    console.log('2. Testing login endpoint...');
    const loginResult = await testLogin();
    
    if (loginResult.success) {
      console.log('Login endpoint works!');
      console.log('Response:', loginResult.data);
    } else {
      console.log('Login endpoint failed!');
      console.log('Error:', loginResult.error);
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugLogin();
