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
const WebSocketServer = WebSocket.Server;
const server = http.createServer(app.callback());
let wssUsers =  new WebSocketServer({noServer:true});
let wssMessage = new WebSocketServer({noServer:true});
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
// 登陆
.post('/login', (ctx, next) => {
  const { body, body:{ userName, status }} = ctx.request;
  console.log('login in',  userName, status)
  ctx.response.status = 200 ;
  ctx.body = {
    code:userName ? 200 : 400,
    data:null,
    msg: userName ? 'login!' :'login fail'
  }
  if(userName) {
    users.push[{...body}]
    createWebSocket(wssUsers, server)
  }
})
// 登出
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

const broadcast = (wss,data) => {
  wss.clients.forEach((client) => {
    if(client.readyState === WebSocket.OPEN){
      client.send(JSON.stringify(data));
    }
  })
}
const createWebSocket = (wss, server) =>  {
  wss.on('connection', (ws, req) => {
    console.log('wss connection')
    ws.on('open', () => {
      console.log('connected')
    })
    ws.on('message', (message) => {
      console.log('receive message is', message)
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
    })
    ws.on('close', () => {
      console.log('close')
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
createWebSocket(wssUsers);
