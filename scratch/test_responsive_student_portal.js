const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

const VIEWPORTS = [
  { name: '1440_desktop', width: 1440, height: 900, dpr: 1, mobile: false },
  { name: '1366_laptop', width: 1366, height: 768, dpr: 1, mobile: false },
  { name: '1024_tablet_lg', width: 1024, height: 768, dpr: 1, mobile: false },
  { name: '768_tablet_sm', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: '375_mobile', width: 375, height: 812, dpr: 2, mobile: true }
];

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-portal-test-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9228/json', (res) => {
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
        expression: `(${expression})`,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    console.log("==========================================");
    console.log("RUNNING RESPONSIVE STUDENT PORTAL TESTS");
    console.log("==========================================");

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dpr,
        mobile: vp.mobile
      });

      // 1. Test Dashboard
      await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
      await new Promise(r => setTimeout(r, 1200));

      const dashAudit = await evaluate(`(() => {
        const header = document.querySelector('header');
        const aside = document.querySelector('aside');
        const scrollContainer = document.querySelector('#main-scroll-container');
        const title = header?.querySelector('h1')?.innerText;
        const subtitle = header?.querySelector('p')?.innerText;
        const hasRoleSwitcher = header ? header.innerText.includes('View') && !header.innerText.includes('Student Dashboard') : false;
        const table = document.querySelector('table');
        const trackBtns = Array.from(document.querySelectorAll('table button')).filter(b => b.innerText.includes('Track'));
        const viewBtns = Array.from(document.querySelectorAll('table button')).filter(b => b.innerText.includes('View'));

        const bodyOverflow = document.body.scrollWidth > window.innerWidth;
        const htmlOverflow = document.documentElement.scrollWidth > window.innerWidth;

        return {
          title,
          subtitle,
          hasRoleSwitcher,
          hasSidebar: !!aside,
          sidebarFixed: aside ? window.getComputedStyle(aside).position : null,
          trackBtnsCount: trackBtns.length,
          viewBtnsCount: viewBtns.length,
          hasWindowOverflow: bodyOverflow || htmlOverflow,
          scrollContainerExists: !!scrollContainer
        };
      })()`);

      console.log(`[Dashboard ${vp.name}] Audit:`, JSON.stringify(dashAudit));

      // Capture screenshot
      const ssDash = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, `screen_05_dashboard_${vp.name}.png`), Buffer.from(ssDash.data, 'base64'));

      // 2. Test New Request Page
      await send('Page.navigate', { url: 'http://localhost:3000/student/new-request' });
      await new Promise(r => setTimeout(r, 1200));

      const nrAudit = await evaluate(`(() => {
        const header = document.querySelector('header');
        const title = header?.querySelector('h1')?.innerText;
        const subtitle = header?.querySelector('p')?.innerText;
        const backBtn = !!header?.querySelector('a[aria-label="Go back"]');
        const stepIndicators = Array.from(document.querySelectorAll('span')).filter(s => ['Service', 'Details', 'Pickup', 'Review'].includes(s.innerText));
        const serviceCards = document.querySelectorAll('button img, button svg').length;
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next'));
        const cancelBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.includes('Cancel'));

        const bodyOverflow = document.body.scrollWidth > window.innerWidth;
        const htmlOverflow = document.documentElement.scrollWidth > window.innerWidth;

        return {
          title,
          subtitle,
          hasBackBtn: backBtn,
          stepCount: stepIndicators.length,
          nextBtnExists: !!nextBtn,
          cancelBtnExists: !!cancelBtn,
          hasWindowOverflow: bodyOverflow || htmlOverflow
        };
      })()`);

      console.log(`[New Request ${vp.name}] Audit:`, JSON.stringify(nrAudit));

      const ssNr = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(brainDir, `screen_06_new_request_${vp.name}.png`), Buffer.from(ssNr.data, 'base64'));
    }

    console.log("\nALL RESPONSIVE AUDITS COMPLETED SUCCESSFULLY!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

