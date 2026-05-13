const http = require('http');

// Test login and get response
const testLoginAuth = () => {
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
        console.log('Login Response:');
        console.log('Status:', res.statusCode);
        console.log('Data:', data);
        
        try {
          const response = JSON.parse(data);
          if (response.token && response.user) {
            console.log('Authentication successful!');
            console.log('Token received:', response.token);
            console.log('User data:', response.user);
            console.log('Redirect to dashboard should work.');
            resolve(true);
          } else {
            console.log('Authentication failed - missing token or user');
            resolve(false);
          }
        } catch (e) {
          console.log('Invalid JSON response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Login request error:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Test user profile endpoint (for dashboard)
const testUserProfile = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/users/profile',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\nUser Profile Response:');
        console.log('Status:', res.statusCode);
        console.log('Data:', data);
        
        try {
          const user = JSON.parse(data);
          if (user.id && user.email) {
            console.log('User profile endpoint working!');
            console.log('Dashboard should be able to load user data.');
            resolve(true);
          } else {
            console.log('User profile endpoint failed');
            resolve(false);
          }
        } catch (e) {
          console.log('Invalid JSON response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Profile request error:', error.message);
      reject(error);
    });
    
    req.end();
  });
};

async function testAuthFlow() {
  console.log('=== TESTING AUTHENTICATE AND REDIRECT ===\n');
  
  try {
    // Test login authentication
    console.log('1. Testing login authentication...');
    const authSuccess = await testLoginAuth();
    
    if (!authSuccess) {
      console.log('Login authentication failed. Redirect will not work.');
      return;
    }
    
    // Test user profile (dashboard data)
    console.log('\n2. Testing user profile endpoint...');
    const profileSuccess = await testUserProfile();
    
    if (authSuccess && profileSuccess) {
      console.log('\n=== AUTHENTICATE AND REDIRECT WORKING ===');
      console.log('Login should authenticate and redirect to dashboard successfully!');
    } else {
      console.log('\nSome components failed. Check backend endpoints.');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuthFlow();
