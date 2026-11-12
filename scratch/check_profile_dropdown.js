const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-dom2-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9227/json', (res) => {
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

    // Click profile button
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('header button'));
        const profBtn = buttons.find(b => b.innerText.includes('Akshay'));
        if (profBtn) profBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const res = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        dropdownText: document.querySelector('.shadow-card')?.innerText,
        links: Array.from(document.querySelectorAll('.shadow-card a, .shadow-card button')).map(el => el.innerText.trim())
      })`,
      returnByValue: true
    });

    console.log("DROPDOWN RESULT:", JSON.parse(res.result.value));
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

