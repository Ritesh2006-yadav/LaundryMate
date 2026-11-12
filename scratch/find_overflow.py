import asyncio
import json
import urllib.request
import subprocess
import time
import websockets

async def check():
    # Start Chrome with remote debugging
    proc = subprocess.Popen([
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--remote-debugging-port=9222',
        '--window-size=390,844',
        'http://localhost:3000/student/login'
    ])
    
    await asyncio.sleep(2)
    try:
        tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
        ws_url = tabs[0]['webSocketDebuggerUrl']
        
        async with websockets.connect(ws_url) as ws:
            # Evaluate script
            eval_msg = {
                "id": 1,
                "method": "Runtime.evaluate",
                "params": {
                    "expression": """
                    (() => {
                        const results = [];
                        document.querySelectorAll('*').forEach(el => {
                            if (el.scrollWidth > 390 || el.offsetWidth > 390) {
                                results.push({
                                    tag: el.tagName,
                                    id: el.id,
                                    className: el.className,
                                    offsetWidth: el.offsetWidth,
                                    scrollWidth: el.scrollWidth,
                                    clientWidth: el.clientWidth
                                });
                            }
                        });
                        return JSON.stringify(results);
                    })()
                    """
                }
            }
            await ws.send(json.dumps(eval_msg))
            resp = await ws.recv()
            data = json.loads(resp)
            print("Overflowing elements:", data.get('result', {}).get('result', {}).get('value'))
    finally:
        proc.terminate()

asyncio.run(check())

