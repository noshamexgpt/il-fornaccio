
const httpProxy = require('http-proxy');
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt'),
};

const proxy = httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 3000
    },
    ws: true
});

proxy.on('error', function (e) {
    // console.log('Proxy error:', e.message);
});

const server = https.createServer(options, function (req, res) {
    proxy.web(req, res);
});

server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
});

server.listen(3001, '0.0.0.0', () => {
    console.log('HTTPS Proxy running at https://0.0.0.0:3001');
    console.log('Forwarding to http://localhost:3000');
});
