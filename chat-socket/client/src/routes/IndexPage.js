import React, { Component } from 'react';
import { Input, Radio, message  } from 'antd';
import parseUrl  from "parse-url";
import REQUSET from '../server';
const RadioGroup = Radio.Group;
const API = 'http://localhost:3000/';
const WSAPI = 'ws://localhost:3000/';
console.log('_USERNAME_',_USERNAME_)
let lockReconnect = false;
let reconnectTimer = '';
class IndexPage extends Component {
  constructor(props) {
    super();
    this.wsMessage = '';
    this.wsUsers = '';
  }
  state = {
    users:[],
    messages:[],
    myInfo:{
      status:0,
      userName:_USERNAME_.username
    }
  }
  componentDidMount() {
    this.createWebSocket('users', '用户websocket')
    this.createWebSocket('message', '信息websocket')
  }
  // 用户登陆登出
  handleChangeRadio = async (e) => {
    const { target:{value}} = e;
    const { userName } = this.state.myInfo;
    const { code, data, msg} = await REQUSET(
      API +  `${value === 1 ? 'login' : 'logOut' }`,
      {
        method:'POST',
        body:JSON.stringify({
          userName,
          status:value
        }),
        headers:{
          'Content-type' : 'application/json'
        }
      }
    )
    if(code === 200 && value == 1) {
      message.success(msg)
    } else if(code === 200 && value == 0) {
        message.success(msg)
    }else {
      message.error(msg)
    }
    this.wsUsers.send(JSON.stringify({userName, status:value}))
    this.setState(preState => ({myInfo:{...preState.myInfo, status:+value}}))
  }
  // 创建webscoket 连接
  createWebSocket = (path, wsName) => {
    try {
      if(path === 'users') {
        this.wsUsers = new WebSocket(WSAPI + path);
        this.wsUsers.heartCheckOption = {
          timeoutTimer:null,
          serverTimeOutTimer:null
        } 
        this.initWebSocket({ws:this.wsUsers, path, wsName})
      }
      if(path == 'message') {
        this.wsMessage = new WebSocket(WSAPI + path);
        this.wsMessage.heartCheckOption = {
          timeoutTimer:null,
          serverTimeOutTimer:null
        } 
        this.initWebSocket({ws:this.wsMessage, path, wsName})
      }
    } catch (error) {
      console.log(error)
      this.reconnect(path, wsName)
    }
  }
  // 初始化 websocket监听事件 
  initWebSocket = ({ws, path, wsName}) => {
    const { myInfo:{status,userName}} = this.state;
    ws.onopen = () => {
      // message.success(`${wsName} : 已连接！`);
      console.log(wsName, '已连接');
      if(path === 'users') {
        const { myInfo } = this.state; 
        this.wsUsers.send(JSON.stringify(myInfo));
      }
      if(path === 'message') {
        this.wsMessage.send(JSON.stringify({userName, status, message:`我来了`}))
      }
    }
    ws.onmessage = (msg) => {
      const { data, currentTarget:{url} } = msg;
      const { pathname } = parseUrl(url);
      this.heartCheck(ws);
      if(data !=='pong') {
        if(pathname === '/users') {
          this.setState({users:JSON.parse(data)});
        }else if(pathname === '/message') {
          this.setState({messages:JSON.parse(data)});
        }
      }
    }
    ws.onclose = () => {
      message.warn(wsName +  '已关闭' ,10);
      console.log(wsName , '已关闭');
      this.reconnect(path, wsName)
    }
    ws.onerror = (error) => {
      console.log(wsName, error);
      message.error(wsName + error.toString(), 10);
      this.reconnect(path, wsName)
    }
  }
  // 重连机制
  reconnect = (path, wsName) => {
    if(lockReconnect) {
      return
    }
    lockReconnect = false;
    reconnectTimer && clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(()=> {
      this.createWebSocket(path, wsName)
    }, 4000)
  }
  // 心跳检测
  heartCheck = (ws) => {
    if( ws.heartCheckOption.timeoutTimer) {
        window.clearTimeout( ws.heartCheckOption.timeoutTimer) ;
        ws.heartCheckOption.timeoutTimer = null;
    } 
    if( ws.heartCheckOption.serverTimeOutTimer) {
      window.clearTimeout( ws.heartCheckOption.serverTimeOutTimer);
      ws.heartCheckOption.serverTimeOutTimer = null;
    }
    ws.heartCheckOption.timeoutTimer = setTimeout(() => {
      ws.send('ping')
      ws.heartCheckOption.serverTimeOutTimer = setTimeout(()=> {
        console.log('heart close')
          ws.close()
      },  3000) 
    },  3000)
  }
  // 消息发送
  handleKeyDown = (e) => {
    const { keyCode, target:{value} } = e;
    if(keyCode === 13) {
      const { userName, status } = this.state.myInfo;
      if(status) {
        const message = JSON.stringify({userName, status, message:value});
        this.wsMessage.send(message);
      }else {
        message.warn('您已经离线了')
      }
    }
  }

  render() {
    const { myInfo:{status, userName }, users, messages} = this.state;
    return (
      <div className="container">
        {/* <h1>简易撩天室</h1> */}
        <div className="content">
          <div className="message-list">
            <div className="message-content">
               {messages.map((msg, i) => (
                 <div key={msg.userName + i} className="message-single">
                   <h5>{msg.userName} 说 </h5>
                   <p>{msg.message}</p>
                 </div>
               ))}
            </div>
            <div>
              <Input onKeyDown={this.handleKeyDown} style={{width:500, margin:'20px'}} />
            </div>
          </div>
          <div className="users-list">
            <div>
              <h4 style={{lineHeight:'40px'}}>Hello {userName}</h4>
              <div>
                <RadioGroup onChange={this.handleChangeRadio} value={status}>
                  <Radio value={1}>在线</Radio>
                  <Radio value={0}>离线</Radio>
                </RadioGroup>
              </div>
            </div>
            <div className="users-list-names">
              {users.map((item, i) => (
                <p style={{lineHeight:'30px'}} key={item.userName + i}>{`【${item.status ? '在线': '离线'}】 ${item.userName}`}</p>
              ))}
            </div>
          </div>
        </div>
        <style jsx>{`
         
        `}</style>
      </div>
    );
  }
}
export default IndexPage;
