# WebSocket 初探 
## HTML5 WebSocket 
- [参考链接](https://www.cnblogs.com/cangqinglang/p/8331120.html)
- WebSocket是HTML5开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。
- 在WebSocket API中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道。两者之间就直接可以数据互相传送。
- 浏览器通过 JavaScript 向服务器发出建立 WebSocket 连接的请求，连接建立以后，客户端和服务器端就可以通过 TCP 连接直接交换数据。
- 当你获取 Web Socket 连接后，你可以通过 send() 方法来向服务器发送数据，并通过 onmessage 事件来接收服务器返回的数据。
- HTML5 定义的 WebSocket 协议，能更好的节省服务器资源和带宽，并且能够更实时地进行通讯
- 现在，很多网站为了实现推送技术，所用的技术都是 Ajax 轮询。轮询是在特定的的时间间隔（如每1秒），由浏览器对服务器发出HTTP请求，然后由服务器返回最新的数据给客户端的浏览器。这种传统的模式带来很明显的缺点，即浏览器需要不断的向服务器发出请求，然而HTTP请求可能包含较长的头部，其中真正有效的数据可能只是很小的一部分，显然这样会浪费很多的带宽等资源。
- （1）建立在 TCP 协议之上，服务器端的实现比较容易。
- （2）与 HTTP 协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器。
- （3）数据格式比较轻量，性能开销小，通信高效。
- （4）可以发送文本，也可以发送二进制数据。
- （5）没有同源限制，客户端可以与任意服务器通信。
- （6）协议标识符是ws（如果加密，则为wss），服务器网址就是 URL。

![图片](http://www.runoob.com/wp-content/uploads/2016/03/ws.png)

## [WebSocket client applications](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
 - WebSocket(url[, protocols]) 第一个参数 url, 指定连接的 URL。第二个参数 protocol 是可选的，指定了可接受的子协议
 ### 属性
 - WebSocket.binaryType 使用二进制的数据类型连接
 - WebSocket.bufferedAmount 未发送至服务器的字节数  
 - WebSocket.extensions 服务器选择的扩展
 - WebSocket.onclose 用于指定连接关闭后的回调函数
 - WebSocket.onerror 用于指定连接失败后的回调函数
 - WebSocket.onmessage 用于指定连接成功后的回调函数 
 - WebSocket.readyState  当前的链接状态 
   ```
    CONNECTING：值为0，表示正在连接。
    OPEN：值为1，表示连接成功，可以通信了。
    CLOSING：值为2，表示连接正在关闭。
    CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
   ```
 - WebSocket.url WebSocket 的绝对路径
 ### 方法
 - WebSocket.close([code[, reason]]) 关闭当前链接
 - WebSocket.send(data) 向服务器发送数据

### [兼容行](https://www.caniuse.com/#search=Web%20socket) 

# WebSocket Server 
## ws: a Node.js WebSocket library 
- [API 参考](https://www.jianshu.com/p/8c471f33989a)
- 应用于服务端、客户端
- 不能在浏览器中使用

### a simple example
```javascript
  //node client 
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:3000/chat')
    ws.on('open', () => {
        setInterval(()=>{
            ws.send(`message from client at : ${new Date().toLocaleTimeString()}`)
        }, 5000)
    })
    ws.on('message', (data) => {
        console.log(`message from server at : ${new Date().toLocaleTimeString()}, message is ${data}`)
    })
    ws.on('error', error => {
        console.log('error in client',error)
    })
 // bowser client
    const wsRun = () => {
      const ws = new WebSocket('ws://localhost:3000')

      ws.onerror = (error) => {
          console.log('出错了',error)
        }

      ws.onmessage = (data) => {
      console.log('message is ', data)
      ws.send('message from bowser ')
    }
  }
 // server
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({port:3000});
    wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`message from client at  ${new Date().toLocaleTimeString()} , message is ${message}`)
    })
    setInterval(() => {
        ws.send(`message from server at : ${new Date().toLocaleTimeString()}`)
    },5000)
})
// External HTTP server
    const http = require('http');
    const WebSocket = require('ws');
    const hostName = 'localhost';
    const port = 3000;
    const Httpserver = http.createServer((req, res) => {
            res.setHeader('Content-Type','text/plain');
            res.end('hello world');
    });

    const wss = new WebSocket.Server({server:Httpserver});
    wss.on('connection', (ws, request) => {
        console.log('connection ',request.url)
        if(request.url === '/chat') {
            ws.on('message', (message) => {
                console.log(`message from client at  ${new Date().toLocaleTimeString()} , message is ${message}`)
            })
            setInterval(() => {
                ws.send(`message from server at : ${new Date().toLocaleTimeString()}`, (error) => {
                    console.log(`server error : ${error} `)
                })
            },5000)
        }
    })
    Httpserver.listen(port, hostName, () => {
        console.log(`服务器运行在http://${hostName}:${port}`);
    })
// Multiple servers sharing a single HTTP/S server

// client 
    const WebSocket = require('ws');
    const ws1 = new WebSocket('ws://localhost:3000/chat')
    ws1.on('open', () => {
        setInterval(()=>{
            ws1.send(`client ws-1 : ${new Date().toLocaleTimeString()}`)
        }, 5000)
    })
    ws1.on('message', (data) => {
        console.log(`message from server -1 at : ${new Date().toLocaleTimeString()}, message is ${data}`)
    })
    ws1.on('error', error => {
        console.log('error in client -1',error)
    })
    const ws2 = new WebSocket('ws://localhost:3000/chat2')
    ws2.on('open', () => {
        setInterval(()=>{
            ws2.send(`client ws-2 : ${new Date().toLocaleTimeString()}`)
        }, 5000)
    })
    ws2.on('message', (data) => {
        console.log(`message from server -2 at : ${new Date().toLocaleTimeString()}, message is ${data}`)
    })
    ws2.on('error', error => {
        console.log('error in client -2',error)
    })
// server 
    const http = require('http');
    const WebSocket = require('ws');
    const url = require('url');
    const hostName = 'localhost';
    const port = 3000;
    const Httpserver = http.createServer((req, res) => {
            res.setHeader('Content-Type','text/plain');
            res.end('hello world');
    });

    const wss1 = new WebSocket.Server({noServer:true});
    const wss2 = new WebSocket.Server({noServer:true});

    wss1.on('connection', (ws, request) => {
        console.log('connection-1 ',request.url)
        ws.on('message', (message) => {
            console.log(`message from client at  ${new Date().toLocaleTimeString()} , message is ${message}`)
        })
        setInterval(() => {
            ws.send(`message from server-1 at : ${new Date().toLocaleTimeString()}`, (error) => {
                console.log(`server error-1 : ${error} `)
            })
        },5000)
    })
    wss2.on('connection', (ws, request) => {
        console.log('connection-2 ',request.url)
        ws.on('message', (message) => {
            console.log(`message from client at  ${new Date().toLocaleTimeString()} , message is ${message}`)
        })
        setInterval(() => {
            ws.send(`message from server-2 at : ${new Date().toLocaleTimeString()}`, (error) => {
                console.log(`server error -2 : ${error} `)
            })
        },5000)
    })
    Httpserver.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname;
        console.log('pathname is',pathname);
        if(pathname === '/chat') {
            wss1.handleUpgrade(request, socket, head, (ws) => {
                wss1.emit('connection', ws, request);
            })
        }else if(pathname === '/chat2') {
            wss2.handleUpgrade(request, socket, head, (ws) => {
                wss2.emit('connection', ws, request);
            })
        }else {
            socket.destroy()
        }
    })
    Httpserver.listen(port, hostName, () => {
        console.log(`服务器运行在http://${hostName}:${port}`);
    })
// Server broadcast
      //server
        const WebSocket = require('ws');
        const wss = new WebSocket.Server({port:3000});
        wss.broadcast = (data) => {
            // console.log(' clients is', wss.clients);
            console.log('broadcase data is', data)
            wss.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN) {
                    client.send(data)
                }
            })

        }
        wss.on('connection', (ws) => {
            ws.on('message', (data) => {
                // console.log(' clients is', wss.clients);
                // wss.broadcast() 
                wss.clients.forEach(client => {
                    if(client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data)
                    }
                })
            })
        })
```
##[(websocket)协议中Ping Pong，Socket通讯ping pong(长连接)](https://blog.csdn.net/ShareUs/article/details/85246287)