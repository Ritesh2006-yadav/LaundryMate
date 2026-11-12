const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-dash-' + Date.now());
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

    // 1. Desktop
    console.log("Capturing Desktop Dashboard (1440x900)...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 2500));

    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    const outDesktop = path.join(brainDir, 'screen_05_dashboard_desktop.png');
    fs.writeFileSync(outDesktop, Buffer.from(ssDesktop.data, 'base64'));
    console.log("Saved desktop screenshot:", outDesktop);

    // 2. Mobile
    console.log("Capturing Mobile Dashboard (390x844)...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 2500));

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    const outMobile = path.join(brainDir, 'screen_05_dashboard_mobile.png');
    fs.writeFileSync(outMobile, Buffer.from(ssMobile.data, 'base64'));
    console.log("Saved mobile screenshot:", outMobile);

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

