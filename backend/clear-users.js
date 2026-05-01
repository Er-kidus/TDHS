const http = require('http');

const PORT = 8080;

// Start with empty users array
let users = [];

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
    // Clear users endpoint
    if (path === '/api/v1/auth/clear-users' && req.method === 'POST') {
      users = [];
      res.writeHead(200);
      res.end(JSON.stringify({ 
        message: 'All users cleared successfully',
        userCount: 0
      }));
      return;
    }

    // Get users endpoint
    if (path === '/api/v1/auth/users' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        users: users,
        count: users.length
      }));
      return;
    }

    // Health
    if (path === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
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
  console.log(`\n🧹 USER MANAGEMENT SERVER STARTED`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`\n🔧 MANAGEMENT ENDPOINTS:`);
  console.log(`   Clear all users: POST http://localhost:${PORT}/api/v1/auth/clear-users`);
  console.log(`   View all users: GET http://localhost:${PORT}/api/v1/auth/users`);
  console.log(`\n✨ Ready to manage users!\n`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server stopping...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
