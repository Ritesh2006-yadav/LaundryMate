const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\2ea223f8-f2d0-473b-9b53-8c62359795b8';

const targets = [
  {
    name: 'screen_03_login_desktop.png',
    url: 'http://localhost:3000/student/login',
    width: 1440,
    height: 900,
    mobile: false
  },
  {
    name: 'screen_03_login_mobile.png',
    url: 'http://localhost:3000/student/login',
    width: 390,
    height: 844,
    mobile: true
  },
  {
    name: 'screen_04_register_desktop.png',
    url: 'http://localhost:3000/student/register',
    width: 1440,
    height: 900,
    mobile: false
  },
  {
    name: 'screen_04_register_mobile.png',
    url: 'http://localhost:3000/student/register',
    width: 390,
    height: 844,
    mobile: true
  }
];

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function capture() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const wsUrl = tabs[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise(resolve => ws.onopen = resolve);

    await sendCommand(ws, 'Page.enable');
    await sendCommand(ws, 'Network.enable');

    for (const t of targets) {
      console.log(`Processing ${t.name} (${t.width}x${t.height})...`);
      
      // Override device metrics
      await sendCommand(ws, 'Emulation.setDeviceMetricsOverride', {
        width: t.width,
        height: t.height,
        deviceScaleFactor: 1,
        mobile: t.mobile
      });

      // Navigate
      await sendCommand(ws, 'Page.navigate', { url: t.url });
      
      // Wait for page to fully render
      await new Promise(r => setTimeout(r, 2500));

      // Capture screenshot
      const { data } = await sendCommand(ws, 'Page.captureScreenshot', {
        format: 'png',
        fromSurface: true
      });

      const outPath = path.join(brainDir, t.name);
      fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
      console.log(`Saved ${outPath} (${fs.statSync(outPath).size} bytes)`);
    }

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);

