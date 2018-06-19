const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 5050, path: '/live-update'});

wss.on('connection', (ws, req) => {

});

module.exports = wss;
