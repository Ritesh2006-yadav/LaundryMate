const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

const pagesToCapture = [
  { url: 'http://localhost:3000/staff/dashboard', filename: 'screen_staff_01_dashboard.png' },
  { url: 'http://localhost:3000/staff/assigned', filename: 'screen_staff_02_assigned.png' },
  { url: 'http://localhost:3000/staff/pickups', filename: 'screen_staff_03_pickups.png' },
  { url: 'http://localhost:3000/staff/process', filename: 'screen_staff_04_process.png' },
  { url: 'http://localhost:3000/staff/delivery', filename: 'screen_staff_05_delivery.png' },
  { url: 'http://localhost:3000/staff/complaints', filename: 'screen_staff_06_complaints.png' },
  { url: 'http://localhost:3000/staff/notifications', filename: 'screen_staff_07_notifications.png' },
  { url: 'http://localhost:3000/staff/profile', filename: 'screen_staff_08_profile.png' },
];

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-staff-screens-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9266',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9266/json', (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const targetTab = tabs.find(t => t.type === 'page') || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Warm-up hit
    console.log('Warm up navigation...');
    await send('Page.navigate', { url: 'http://localhost:3000/staff/dashboard' });
    await new Promise(r => setTimeout(r, 3000));

    for (const p of pagesToCapture) {
      console.log('Navigating to', p.url);
      await send('Page.navigate', { url: p.url });
      await new Promise(r => setTimeout(r, 2000));

      const ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, p.filename), Buffer.from(ss.data, 'base64'));
      console.log('Captured', p.filename);
    }

    console.log('ALL 8 STAFF PORTAL SCREENSHOTS CAPTURED PERFECTLY!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
