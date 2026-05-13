const http = require('http');

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
        console.log('Backend Status:', res.statusCode);
        console.log('Response:', data);
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (error) => {
      console.error('Backend not running:', error.message);
      reject(error);
    });
    
    req.end();
  });
};

testBackend().then(running => {
  if (running) {
    console.log('Backend is running - login should work');
  } else {
    console.log('Backend is not running - login will fail');
  }
}).catch(err => {
  console.log('Backend connection failed - start backend server first');
});
