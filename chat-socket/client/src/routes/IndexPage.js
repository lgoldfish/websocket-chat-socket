import React, { Component } from 'react';
import { Input, Radio, message  } from 'antd';
import parseUrl  from "parse-url";
import REQUSET from '../server';
const RadioGroup = Radio.Group;
const API = 'http://localhost:3000/';
const WSAPI = 'ws://localhost:3000/';
console.log('_USERNAME_',_USERNAME_)
class IndexPage extends Component {
  constructor(props) {
    super();
    this.wsMessage = '';
    this.wsUsers = ''
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
    this.wsMessage = new WebSocket(WSAPI + 'message');
    this.wsUsers = new WebSocket(WSAPI + 'users');
    this.initWebSocket({ws:this.wsUsers, path:'users', wsName:'用户'})
    this.initWebSocket({ws:this.wsMessage, path:'message', wsName:'消息'})
  }
  initWebSocket = ({ws, path, wsName}) => {
    const { myInfo:{status,userName}} = this.state;
    ws.onopen = () => {
      // message.success(`${wsName} : 已连接！`);
      console.log(wsName, '已连接');
      if(path === 'users') {
        const { myInfo } = this.state; 
        ws.send(JSON.stringify(myInfo));
      }
      if(path === 'message') {
        this.wsMessage.send(JSON.stringify({userName, status, message:`我来了`}))
      }
    }
    ws.onmessage = (msg) => {
      const { data, currentTarget:{url} } = msg;
      const { pathname } = parseUrl(url);
      if(pathname === '/users') {
        this.setState({users:JSON.parse(data)});
      }else if(pathname === '/message') {
        this.setState({messages:JSON.parse(data)});
      }
    }
    ws.onclose = () => {
      message.warn(wsName +  '已关闭' ,10);
      console.log(wsName , '已关闭');
    }
    ws.onerror = (error) => {
      console.log(wsName, error);
      message.error(wsName + error.toString(), 10);
    }
  }
  handleKeyDown = (e) => {
    const { keyCode, target:{value} } = e;
    if(keyCode === 13) {
      const { userName, status } = this.state.myInfo;
      if(status) {
        const message = JSON.stringify({userName, status, message:value});
        console.log('message is',message, this.wsMessage)
        this.wsMessage.send(message);
      }else {
        message.warn('您已经离线了')
      }
    }
  }
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
          .container {
            width:900px;
            margin:0 auto;
          }
          h1 {
            text-align:center;
            padding-top:50px;
          }
          .content {
            background:#85f0f5;
            margin:20px auto;
            height:600px;
            display:flex;
            justify-content:space-between;
          }
          .message-list {
            width:600px;
            margin: 10px; 
            display:initial;
            border:5px solid white;
          }
          .users-list {
            width:260px;
            border:5px solid white;
            margin:10px;
            padding:0 5px;
          }
          .users-list-names {
            border-top:2px solid white;
            margin-top:20px;
            padding-top:20px;
          }
          .message-content {
            height:500px;
            overflow-y:scroll;
            border:5px solid white;
            background:#ffffff;
            padding:10px;
          }
          .message-single {
            background:#e0effc;
            border-radius:4px;
            margin:5px 0;
            padding:5px;
          }
          .message-single h5 {
            font-size:16px;
            line-height:20px;
            padding-bottom:10px;
          }
        `}</style>
      </div>
    );
  }
}
export default IndexPage;
