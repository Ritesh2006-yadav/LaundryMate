const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const brainDir = path.resolve('C:/Users/aksha/.gemini/antigravity/brain/2ea223f8-f2d0-473b-9b53-8c62359795b8');

async function main() {
  const tmpDir = path.join(os.tmpdir(), 'chrome-header-test-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tmpDir,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9225/json', (res) => {
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

    console.log("Testing Student Dashboard Header on 1440x900...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify RoleSwitcher presence
    const headerCheck = await evaluate(`(() => {
      const header = document.querySelector('header');
      const allButtons = Array.from(header.querySelectorAll('button')).map(b => b.innerText.trim());
      const hasRoleSwitcher = allButtons.some(t => t.includes('Student View') || t.includes('View'));
      const hasSwitchRolePopup = !!document.querySelector('.lucide-graduation-cap');
      
      const title = header.querySelector('h1')?.innerText;
      const subtitle = header.querySelector('p')?.innerText;
      const notifBtn = !!header.querySelector('button[aria-label="Notifications"]');
      const profileBtn = allButtons.find(t => t.includes('Akshay') || t.includes('Student'));

      return {
        hasRoleSwitcher,
        hasSwitchRolePopup,
        title,
        subtitle,
        notifBtn,
        profileBtn,
        headerButtons: allButtons
      };
    })()`);

    console.log("Header Check:", JSON.stringify(headerCheck, null, 2));

    // Capture clean desktop screenshot
    const ssDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_desktop.png'), Buffer.from(ssDesktop.data, 'base64'));

    // Test Clicking Profile Button to verify dropdown items
    await evaluate(`(() => {
      const header = document.querySelector('header');
      const buttons = Array.from(header.querySelectorAll('button'));
      const profileBtn = buttons.find(b => b.innerText.includes('Akshay') || b.innerText.includes('Student'));
      if (profileBtn) profileBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const dropdownCheck = await evaluate(`(() => {
      const dropdown = document.querySelector('.shadow-card');
      if (!dropdown) return null;
      return {
        text: dropdown.innerText,
        links: Array.from(dropdown.querySelectorAll('a, button')).map(el => el.innerText.trim())
      };
    })()`);

    console.log("Profile Dropdown Check:", JSON.stringify(dropdownCheck, null, 2));

    // Capture Mobile (390x844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000/student/dashboard' });
    await new Promise(r => setTimeout(r, 1500));
    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(brainDir, 'screen_05_dashboard_mobile.png'), Buffer.from(ssMobile.data, 'base64'));

    console.log("Header tests completed successfully!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);

