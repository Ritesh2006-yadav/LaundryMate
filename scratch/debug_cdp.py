import subprocess
import time
import json
import urllib.request

# Start chrome with remote debugging
proc = subprocess.Popen([
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    'http://localhost:3000/student/login'
])

time.sleep(2)
try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
    print("Chrome tabs:", len(tabs))
    ws_url = tabs[0]['webSocketDebuggerUrl']
    print("WS URL:", ws_url)
finally:
    proc.terminate()

