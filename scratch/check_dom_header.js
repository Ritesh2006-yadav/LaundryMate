const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-dom-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9226/json', (res) => {
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
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 2000));

    const res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        headerText: document.querySelector('header')?.innerText,
        hasRoleSwitcher: !!document.querySelector('header')?.innerText.includes('View'),
        buttons: Array.from(document.querySelectorAll('header button')).map(b => b.innerText || b.getAttribute('aria-label'))
      })`,
      returnByValue: true
    });

    console.log("DOM RESULT:", JSON.parse(res.result.value));
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

