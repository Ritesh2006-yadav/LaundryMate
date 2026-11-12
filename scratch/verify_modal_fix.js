const { spawn } = require('child_process');
const http = require('http');

async function sendCommand(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

(async () => {
  const port = 9333;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const os = require('os');
  const path = require('path');
  const tmpDir = path.join(os.tmpdir(), 'chrome-test-' + Date.now());
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800'
  ]);

  // Poll until Chrome remote debugger is up
  let connected = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json/version`, res => {
          if (res.statusCode === 200) resolve();
          else reject();
        });
        req.on('error', reject);
      });
      connected = true;
      break;
    } catch (e) {}
  }
  console.log('Chrome connected:', connected);

  const newTarget = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: '/json/new?http://localhost:3000/staff/dashboard',
      method: 'PUT'
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });

  const ws = new WebSocket(newTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  await sendCommand(ws, 'Runtime.enable');
  await sendCommand(ws, 'Page.enable');

  // Wait for page to finish compiling & render
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await sendCommand(ws, 'Runtime.evaluate', {
      expression: '!!document.getElementById("main-scroll-container")',
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) {
      ready = true;
      break;
    }
  }
  console.log('Page ready:', ready);

  // Step 1: Scroll main-scroll-container down to bottom
  const scrollRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const scroller = document.getElementById('main-scroll-container');
        if (scroller) {
          scroller.scrollTop = 700;
          return { scrolled: true, scrollTop: scroller.scrollTop };
        }
        return { scrolled: false };
      })()
    `,
    returnByValue: true
  });
  console.log('Scroll Result:', scrollRes.result.value);

  // Step 2: Click the 'Update' button on one of the rows in the table
  const clickRes = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const updateBtns = btns.filter(b => b.textContent && b.textContent.trim().includes('Update'));
        if (updateBtns.length > 0) {
          const target = updateBtns[0];
          target.click();
          return { clicked: true, text: target.textContent.trim(), total: updateBtns.length };
        }
        return { clicked: false, allBtns: btns.map(b => b.textContent.trim()) };
      })()
    `,
    returnByValue: true
  });
  console.log('Click Result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1200));

  // Step 3: Check modal position
  const modalInfo = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const bodyChildren = Array.from(document.body.children).map(c => ({ tag: c.tagName, class: c.className }));
        const modal = document.querySelector('.fixed.inset-0.z-50') || document.querySelector('[class*="fixed inset-0"]');
        if (!modal) return { found: false, bodyChildren };
        const rect = modal.getBoundingClientRect();
        const card = modal.querySelector('.relative.w-full') || modal.children[1] || modal;
        const cr = card ? card.getBoundingClientRect() : null;
        return {
          found: true,
          viewport: { w: window.innerWidth, h: window.innerHeight },
          modal: { top: rect.top, bottom: rect.bottom, height: rect.height },
          card: cr ? { top: cr.top, bottom: cr.bottom, height: cr.height } : null,
          bodyOverflow: document.body.style.overflow,
          scrollerOverflow: document.getElementById('main-scroll-container')?.style.overflowY
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Modal Info:', JSON.stringify(modalInfo.result.value, null, 2));

  // Step 4: Screenshot
  const shot = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  const fs = require('fs');
  fs.writeFileSync('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8/screen_modal_fixed_viewport.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to screen_modal_fixed_viewport.png');

  ws.close();
  chromeProc.kill();
})();
