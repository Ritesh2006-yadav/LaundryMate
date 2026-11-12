const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    'http://localhost:3000/student/login'
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

    await new Promise((resolve) => ws.onopen = resolve);

    const evalPromise = new Promise((resolve) => {
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === 1) {
          resolve(JSON.parse(msg.result.result.value));
        }
      };
    });

    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const card = document.querySelector('.rounded-3xl');
          return JSON.stringify({
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            bodyWidth: document.body.clientWidth,
            cardRect: card ? card.getBoundingClientRect() : null
          });
        })()`
      }
    }));

    const results = await evalPromise;
    console.log("Dimensions:", results);
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

