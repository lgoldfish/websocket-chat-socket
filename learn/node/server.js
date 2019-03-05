const WebSocket = require('ws');
const wss = new WebSocket.Server({port:3000});
wss.on('connection', (ws) => {
    console.log('connection')
    ws.on('message', (msg) => {
        console.log(msg)
    })
    setInterval(()=> {
        ws.send('server' + new Date().toLocaleTimeString())
    }, 5000)
})
console.log(wss.address())