const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

async function testMobileCDP() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-cdp-' + Date.now());
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

    // Set mobile device metrics
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send('Page.navigate', { url: 'http://localhost:3000/student/login' });
    await new Promise(r => setTimeout(r, 2000));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.rounded-3xl');
        return JSON.stringify({
          windowWidth: window.innerWidth,
          cardWidth: card ? card.offsetWidth : null,
          cardLeft: card ? card.getBoundingClientRect().left : null,
          cardRight: card ? card.getBoundingClientRect().right : null,
        });
      })()`,
      returnByValue: true
    });

    console.log("Mobile metrics check:", check.result.value);

    // Capture screenshot
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = 'C:\\Users\\aksha\\.gemini\antigravity\\brain\\2ea223f8-f2d0-473b-9b53-8c62359795b8\\screen_03_login_mobile.png';
    fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
    console.log("Saved mobile screenshot to:", outPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testMobileCDP().catch(console.error);

