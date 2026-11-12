import os
import subprocess

browser = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
brain_dir = r'C:\Users\aksha\.gemini\antigravity\brain\2ea223f8-f2d0-473b-9b53-8c62359795b8'

tasks = [
    {
        'name': 'screen_03_login_desktop.png',
        'url': 'http://localhost:3000/student/login',
        'width': 1440,
        'height': 900,
    },
    {
        'name': 'screen_03_login_mobile.png',
        'url': 'http://localhost:3000/student/login',
        'width': 390,
        'height': 844,
    },
    {
        'name': 'screen_04_register_desktop.png',
        'url': 'http://localhost:3000/student/register',
        'width': 1440,
        'height': 900,
    },
    {
        'name': 'screen_04_register_mobile.png',
        'url': 'http://localhost:3000/student/register',
        'width': 390,
        'height': 844,
    },
]

for t in tasks:
    out = os.path.join(brain_dir, t['name'])
    cmd = [
        browser,
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        f'--screenshot={out}',
        f'--window-size={t["width"]},{t["height"]}',
        '--virtual-time-budget=2000',
        t['url']
    ]
    print(f"Capturing {t['name']} ({t['width']}x{t['height']})...")
    subprocess.run(cmd, check=True)
    if os.path.exists(out):
        print(f"Saved: {out} ({os.path.getsize(out)} bytes)")
    else:
        print(f"Failed to save: {out}")

print("All screenshots completed successfully.")

