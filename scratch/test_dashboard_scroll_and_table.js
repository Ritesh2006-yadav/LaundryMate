const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-test-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9223/json', (res) => {
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

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    console.log("=== 1. DESKTOP TEST (1440x900) ===");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 2000));

    // Capture initial desktop screenshot
    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_desktop.png'), Buffer.from(ssDesktop.data, 'base64'));

    // Check DOM Elements
    const initialTest = await evaluate(`(() => {
      const sidebar = document.querySelector('aside');
      const header = document.querySelector('header');
      const tableHeaders = Array.from(document.querySelectorAll('table th')).map(th => th.innerText.trim());
      const trackButtons = Array.from(document.querySelectorAll('table button')).filter(b => b.innerText.includes('Track'));
      const viewButtons = Array.from(document.querySelectorAll('table button')).filter(b => b.innerText.includes('View Details'));
      const scrollableDiv = document.querySelector('.overflow-y-auto');

      return {
        sidebarRect: sidebar ? { top: sidebar.getBoundingClientRect().top, height: sidebar.getBoundingClientRect().height, width: sidebar.getBoundingClientRect().width } : null,
        headerRect: header ? { top: header.getBoundingClientRect().top, height: header.getBoundingClientRect().height } : null,
        tableHeaders,
        trackButtonCount: trackButtons.length,
        viewButtonCount: viewButtons.length,
        hasScrollableContainer: !!scrollableDiv
      };
    })()`);

    console.log("Initial Desktop Elements:", JSON.stringify(initialTest, null, 2));

    // Now SCROLL the main content container down by 450px!
    await evaluate(`(() => {
      const scrollableDiv = document.querySelector('#main-scroll-container');
      if (scrollableDiv) {
        scrollableDiv.scrollTop = 450;
      }
    })()`);
    await new Promise(r => setTimeout(r, 600));

    // Check positions again after scroll
    const postScrollTest = await evaluate(`(() => {
      const sidebar = document.querySelector('aside');
      const header = document.querySelector('header');
      const scrollableDiv = document.querySelector('#main-scroll-container');

      return {
        scrollTop: scrollableDiv ? scrollableDiv.scrollTop : 0,
        sidebarRectAfterScroll: sidebar ? { top: sidebar.getBoundingClientRect().top, height: sidebar.getBoundingClientRect().height } : null,
        headerRectAfterScroll: header ? { top: header.getBoundingClientRect().top, height: header.getBoundingClientRect().height } : null,
        sidebarMoved: sidebar ? sidebar.getBoundingClientRect().top !== 0 : true,
        headerMoved: header ? header.getBoundingClientRect().top !== 0 : true
      };
    })()`);

    console.log("Post-Scroll Checks:", JSON.stringify(postScrollTest, null, 2));

    // Capture Scrolled Screenshot
    const ssScrolled = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_desktop_scrolled.png'), Buffer.from(ssScrolled.data, 'base64'));

    console.log("=== 2. TABLET TEST (820x1080) ===");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 820,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 1000));
    const ssTablet = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_tablet.png'), Buffer.from(ssTablet.data, 'base64'));

    console.log("=== 3. MOBILE TEST (390x844) ===");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));
    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_mobile.png'), Buffer.from(ssMobile.data, 'base64'));

    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
