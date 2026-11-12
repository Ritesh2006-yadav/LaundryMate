const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

const configs = [
  {
    name: 'screen_03_login_desktop.png',
    url: 'http://localhost:3000/student/login',
    width: 1440,
    height: 900,
    dpr: 1,
    mobile: false
  },
  {
    name: 'screen_03_login_mobile.png',
    url: 'http://localhost:3000/student/login',
    width: 390,
    height: 844,
    dpr: 2,
    mobile: true
  },
  {
    name: 'screen_04_register_desktop.png',
    url: 'http://localhost:3000/student/register',
    width: 1440,
    height: 900,
    dpr: 1,
    mobile: false
  },
  {
    name: 'screen_04_register_mobile.png',
    url: 'http://localhost:3000/student/register',
    width: 390,
    height: 844,
    dpr: 2,
    mobile: true
  }
];

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-ss-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', (res) => {
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

    for (const c of configs) {
      console.log(`Setting up ${c.name} (${c.width}x${c.height}, mobile=${c.mobile})...`);
      
      await send('Emulation.setDeviceMetricsOverride', {
        width: c.width,
        height: c.height,
        deviceScaleFactor: c.dpr,
        mobile: c.mobile
      });

      await send('Page.navigate', { url: c.url });
      await new Promise(r => setTimeout(r, 2000));

      const ss = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(brainDir, c.name);
      fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
      console.log(`Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
    }

    ws.close();
    console.log("All screenshots captured cleanly via CDP.");
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

