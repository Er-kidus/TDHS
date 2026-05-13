const http = require('http');

const PORT = 8080;

// Simple in-memory data
const users = [
  { id: 1, email: 'admin@test.com', password: 'admin123', first_name: 'Admin', last_name: 'User', role: 'admin' },
  { id: 2, email: 'pharmacist@test.com', password: 'pharm123', first_name: 'John', last_name: 'Pharmacist', role: 'pharmacist' },
  { id: 3, email: 'tech@test.com', password: 'tech123', first_name: 'Jane', last_name: 'Technician', role: 'technician' }
];

// Parse body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } 
      catch (error) { reject(error); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // Check email endpoint
    if (path === '/api/v1/auth/check-email' && req.method === 'POST') {
      const body = await parseBody(req);
      const existingUser = users.find(u => u.email === body.email);
      
      res.writeHead(200);
      res.end(JSON.stringify({ 
        exists: !!existingUser,
        message: existingUser ? 'Email already registered' : 'Email available'
      }));
      return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n📧 EMAIL CHECK SERVER STARTED`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔗 Check email: POST http://localhost:${PORT}/api/v1/auth/check-email`);
  console.log(`\n👤 EXISTING EMAILS:`);
  console.log(`   admin@test.com`);
  console.log(`   pharmacist@test.com`);
  console.log(`   tech@test.com`);
  console.log(`\n✨ Ready to check email availability!\n`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server stopping...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
