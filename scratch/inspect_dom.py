import urllib.request
import re

# Let's inspect CSS and HTML
req = urllib.request.urlopen('http://localhost:3000/student/login')
html = req.read().decode('utf-8')
print("Login HTML length:", len(html))

