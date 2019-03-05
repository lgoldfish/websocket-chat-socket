const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000')
ws.on('open', () => {
    console.log('open')
    setInterval(()=> {
        ws.send( 'client node'+ new Date().toLocaleTimeString())
    }, 5000)
})
ws.on('message', (msg) => {
    console.log(msg)
})