import urllib.request

html = urllib.request.urlopen('http://localhost:3000/student/login').read().decode('utf-8')
print("Has viewport:", "name=\"viewport\"" in html or "viewport" in html)
for part in html.split("<meta"):
    if "viewport" in part:
        print("<meta" + part.split(">")[0] + ">")

