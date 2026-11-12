const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

const STUDENT_ROUTES = [
  { path: '/student/dashboard', name: 'screen_05_dashboard', title: 'Student Dashboard' },
  { path: '/student/new-request', name: 'screen_06_new_request', title: 'New Laundry Request' },
  { path: '/student/my-orders', name: 'screen_07_my_orders', title: 'My Laundry Orders' },
  { path: '/student/track-order/LMS1054', name: 'screen_08_track_order', title: 'Track Order #LMS1054' },
  { path: '/student/complaints', name: 'screen_09_complaints', title: 'Complaints & Support' },
  { path: '/student/notifications', name: 'screen_10_notifications', title: 'Notifications' },
  { path: '/student/profile', name: 'screen_11_profile', title: 'Profile & Settings' },
];

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-audit-all-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9231/json', (res) => {
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log("==========================================");
    console.log("AUDITING ALL 7 STUDENT PORTAL SCREENS");
    console.log("==========================================");

    for (const route of STUDENT_ROUTES) {
      console.log(`\nTesting ${route.path} ...`);
      await send('Page.navigate', { url: `http://localhost:3000${route.path}` });
      await new Promise(r => setTimeout(r, 2500));

      const audit = await evaluate(`(() => {
        const header = document.querySelector('header');
        const aside = document.querySelector('aside');
        const title = header?.querySelector('h1')?.innerText;
        const subtitle = header?.querySelector('p')?.innerText;
        const hasRoleSwitcher = header ? header.innerText.includes('View') && !header.innerText.includes('Student Dashboard') && !header.innerText.includes('View All') : false;
        const profileBtn = !!Array.from(header?.querySelectorAll('button') || []).find(b => b.innerText.includes('Akshay'));
        const notifBtn = !!header?.querySelector('button[aria-label="Notifications"]');

        return {
          title,
          subtitle,
          hasRoleSwitcher,
          hasSidebar: !!aside,
          hasProfileBtn: profileBtn,
          hasNotifBtn: notifBtn
        };
      })()`);

      console.log(`[${route.name}] Audit:`, JSON.stringify(audit));

      const ss = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(brainDir, `${route.name}_desktop.png`);
      fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
      console.log(`Saved screenshot: ${outPath}`);
    }

    console.log("\nALL 7 STUDENT PORTAL SCREENS AUDITED & CAPTURED SUCCESSFULLY!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

