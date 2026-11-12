const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-test-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tmpDir,
    '--window-size=390,844',
    'http://localhost:3000/student/login'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    console.log("All tabs:", tabs.map(t => ({ url: t.url, type: t.type })));
    const targetTab = tabs.find(t => t.url.includes('student/login')) || tabs[0];
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    function evalCode(expr) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result?.result?.value);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
      });
    }

    const info = await evalCode(`(() => {
      const card = document.querySelector('.rounded-3xl');
      let curr = card;
      const chain = [];
      while (curr) {
        chain.push({
          tag: curr.tagName,
          className: curr.className,
          offsetWidth: curr.offsetWidth,
          clientWidth: curr.clientWidth,
          scrollWidth: curr.scrollWidth,
          computedWidth: window.getComputedStyle(curr).width,
          computedMaxWidth: window.getComputedStyle(curr).maxWidth
        });
        curr = curr.parentElement;
      }
      return {
        windowInnerWidth: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        bodyClientWidth: document.body.clientWidth,
        chain
      };
    })()`);

    console.log(JSON.stringify(info, null, 2));
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
