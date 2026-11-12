const http = require('http');

const routes = [
  '/staff/dashboard',
  '/staff/assigned',
  '/staff/pickups',
  '/staff/requests',
  '/staff/process',
  '/staff/delivery',
  '/staff/ready',
  '/staff/complaints',
  '/staff/notifications',
  '/staff/profile'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get('http://localhost:3000' + route, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        console.log(`${route} -> ${res.statusCode} (${time}ms, ${raw.length} bytes)`);
        resolve({ route, statusCode: res.statusCode, time });
      });
    }).on('error', (err) => {
      console.error(`${route} -> ERROR: ${err.message}`);
      resolve({ route, statusCode: 500, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing Staff Routes...');
  for (const r of routes) {
    await checkRoute(r);
  }
}

run();

