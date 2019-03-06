const WebSocket = require('ws');
const wss = new  WebSocket.Server({port:3000})
wss.on('connection', (ws)=> {
    console.log('connection')
   let msggobal = ''
    ws.on('message', (msg) => {
        console.log(msg)
        msggobal = msg
      wss.clients.forEach((ws2) => {
        ws2.send(msg)
      })
    })
})
wss.address()