const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Reverse Proxy to GeoServer (Port 8080) for bypass CORS
  if (req.url.startsWith('/geoserver')) {
    const geoReq = http.request({
      hostname: 'localhost',
      port: 8080,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'localhost:8080' }
    }, (geoRes) => {
      res.writeHead(geoRes.statusCode, {
        ...geoRes.headers,
        'Access-Control-Allow-Origin': '*'
      });
      geoRes.pipe(res);
    });
    geoReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy Error to GeoServer: ' + err.message);
    });
    req.pipe(geoReq);
    return;
  }

  // Static File Serving
  let safeUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, safeUrl === '/' ? 'index.html' : safeUrl);
  let ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`WebGIS Karhutla Kalimantan Server Running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`GeoServer Proxy: http://localhost:${PORT}/geoserver`);
  console.log(`====================================================`);
});
