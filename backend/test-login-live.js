const http = require('http');

// Test login with real-time logging
const testLoginLive = () => {
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
    
    console.log('=== LIVE LOGIN TEST ===');
    console.log('Sending login request...');
    console.log('Data:', postData);
    
    const req = http.request(options, (res) => {
      console.log('Response received!');
      console.log('Status code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        console.log('Data chunk received:', chunk.toString());
      });
      
      res.on('end', () => {
        console.log('Complete response body:', data);
        
        try {
          const response = JSON.parse(data);
          console.log('Parsed JSON response:', response);
          
          if (response.token && response.user) {
            console.log('SUCCESS: Login authentication works!');
            console.log('Token:', response.token);
            console.log('User:', response.user);
            resolve({ success: true, response });
          } else {
            console.log('FAILED: Missing token or user in response');
            resolve({ success: false, error: 'Invalid response format' });
          }
        } catch (e) {
          console.log('FAILED: Invalid JSON response');
          console.log('JSON parse error:', e.message);
          resolve({ success: false, error: 'JSON parse failed' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('REQUEST FAILED:', error.message);
      console.error('This means backend is not running or not accessible');
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

testLoginLive().then(result => {
  console.log('\n=== TEST RESULT ===');
  if (result.success) {
    console.log('Login endpoint is working. Frontend should be able to authenticate.');
  } else {
    console.log('Login endpoint failed. Frontend will show error.');
    console.log('Error:', result.error);
  }
}).catch(error => {
  console.error('Test failed completely:', error.message);
});
