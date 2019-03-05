const WebSocket = require('ws');
const url = require('url');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const http = require('http');
const app = new Koa();
const cors = require('koa2-cors');
const router = new Router();
const users = [];
const chatMessageList = [];
const WebSocketServer = WebSocket.Server;
const server = http.createServer(app.callback());
let wssUsers =  new WebSocketServer({noServer:true});
let wssMessage = new WebSocketServer({noServer:true});
// 广播
const broadcast = (wss,data) => {
  wss.clients.forEach((client) => {
    if(client.readyState === WebSocket.OPEN){
      client.send(JSON.stringify(data));
    }
  })
}
// 创建socket
const createWebSocket = (wss) =>  {
  wss.on('connection', (ws, req) => {
    const pathname = url.parse(req.url).pathname;
    console.log('wss connection', pathname)
    ws.on('open', () => {
      console.log('connected')
    })
    ws.on('message', (message) => {
      console.log('receive message is', message)
      if(message === 'ping') {
        ws.send('pong')
        return;
      }
      if(pathname === '/users') {
        const user = JSON.parse(message);
        if(users.findIndex(item => item.userName === user.userName) < 0) {
          users.push(user)
        }else {
          users.forEach(item => {
            if(item.userName === user.userName) {
              item.status = user.status;
            }
          })
        }
        broadcast(wss, users)
      }else if(pathname === '/message'){
        const chatMessage = JSON.parse(message);
        chatMessageList.push(chatMessage)
        chatMessageList.splice(0, chatMessageList.length -7);
        broadcast(wss, chatMessageList)
      }
    })
    ws.on('close', () => {
      console.log('close')
      ws.close()
    })
    ws.on('error', (error) => {
      console.log(error)
    })
  })
  wss.on('error', (err) => {
      console.log(' wss error', err)
  })
  wss.on('close', () => {
    console.log('wss close')
  })
  wss.on('headers', (headers, req) => {
    // console.log('wss headers ', headers, req)
  })
}
app.use(bodyParser());
app.use(cors({
  origin:(ctx => {
    return '*'
  }),
  allowMethods: ['GET', 'POST', 'DELETE']
}))

router.get('/', (ctx, next) => {
  ctx.response.status = 200;
  ctx.response.body = '<h1> hello koa ws </h1>'
})
// 登陆 api
.post('/login', (ctx, next) => {
  const { body, body:{ userName, status }} = ctx.request;
  ctx.response.status = 200 ;
  ctx.body = {
    code:userName ? 200 : 400,
    data:null,
    msg: userName ? 'login!' :'login fail'
  }
  if(userName) {
    users.push[{...body}]
  }
})
// 登出 api
.post('/logOut', (ctx, next) => {
  const { body:{ userName, status }} = ctx.request;
  console.log('login in',  userName, status)
  ctx.response.status = 200 ;
  ctx.body = {
    code:userName ? 200 : 400,
    data:null,
    msg: userName ? 'logOut!' :'logOut fail'
  }
  if(userName) {
    console.log(users)
    users.forEach(item => {
      if(item.userName === userName) {
        item.status = status
      }
    })
    broadcast(wssUsers, users)
  }
})
app.use(router.routes()).use(router.allowedMethods());
// 多个websocket 服务托管给http server
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  console.log('pathname is',pathname);
  if(pathname === '/users') {
      wssUsers.handleUpgrade(request, socket, head, (ws) => {
          wssUsers.emit('connection', ws, request);
      })
  }else if(pathname === '/message') {
      wssMessage.handleUpgrade(request, socket, head, (ws) => {
          wssMessage.emit('connection', ws, request);
      })
  }else {
      socket.destroy()
  }
})
server.listen(3000);
server.on('error', error => {
  console.log('error in server', error)
})
server.on('listening',() => {
  const addr = server.address()
  console.log(addr)
} )
const reconnect = (url) => {

}
createWebSocket(wssUsers)
createWebSocket(wssMessage)


