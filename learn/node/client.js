const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/chat')
ws.on('message', (msg) => {
    console.log(msg)
})
setInterval(() => {
    ws.send('i am node client')
}, 3000)