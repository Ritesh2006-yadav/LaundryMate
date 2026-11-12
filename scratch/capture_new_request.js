const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-nr-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9224/json', (res) => {
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

    console.log("Navigating to http://localhost:3000/student/new-request ...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/new-request' });
    await new Promise(r => setTimeout(r, 2500));

    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_06_new_request_desktop.png'), Buffer.from(ssDesktop.data, 'base64'));
    console.log("Desktop screenshot saved.");

    // Mobile
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));
    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_06_new_request_mobile.png'), Buffer.from(ssMobile.data, 'base64'));
    console.log("Mobile screenshot saved.");

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

