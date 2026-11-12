const http = require('http');

http.get('http://localhost:3000/staff/dashboard', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const cssMatches = data.match(/<link[^>]+stylesheet[^>]+>/g);
    console.log('STATUS:', res.statusCode, 'CSS LINKS:', cssMatches);
    if (cssMatches && cssMatches[0]) {
      const match = cssMatches[0].match(/href="([^"]+)"/);
      if (match) {
        const href = match[1];
        http.get('http://localhost:3000' + href, (cssRes) => {
          let cssData = '';
          cssRes.on('data', c => cssData += c);
          cssRes.on('end', () => {
            console.log('CSS URL:', href, 'STATUS:', cssRes.statusCode, 'LENGTH:', cssData.length);
          });
        });
      }
    }
  });
}).on('error', console.error);

