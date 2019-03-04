import React, { Component } from 'react';
import { Input, Radio, message  } from 'antd';
import REQUSET from '../server';
const RadioGroup = Radio.Group;
const API = 'http://localhost:3000/';
const WSAPI = 'ws://localhost:3000/'
class IndexPage extends Component {
  constructor(props) {
    super();
  }
  state = {
    users:[],
    messages:[],
    myInfo:{
      status:0,
      userName:'wqf'
    }
  }
  initWebSocket = ({path, wsName}) => {
    const ws = new WebSocket(WSAPI + path);
    ws.onopen = () => {
      message.success(`${wsName} : 已连接！`);
      console.log(wsName, '已连接');
      const { myInfo } = this.state; 
      console.log('发送user',myInfo);
      ws.send(JSON.stringify(myInfo))
    }
    ws.onmessage = (msg) => {
      console.log('onmessage ', msg);
      const { data } = msg;
      this.setState({users:JSON.parse(data)});
    }
    ws.onclose = () => {
      message.warn(wsName, '已关闭');
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
      console.log('value is', value);
    }
  }
  handleChangeRadio = async (e) => {
    const { target:{value}} = e;
    console.log(value)
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
    if(code === 200) {
      message.success(msg)
      this.initWebSocket({path:'users', wsName:'用户'})
    }else {
      message.error(msg)
    }
    this.setState(preState => ({myInfo:{...preState.myInfo, status:value}}))
  }
  render() {
    const { myInfo:{status, userName }, users} = this.state;
    return (
      <div className="container">
        {/* <h1>简易撩天室</h1> */}
        <div className="content">
          <div className="message-list">
            <div className="message-content">
               message
            </div>
            <div>
              <Input onKeyDown={this.handleKeyDown} style={{width:500, margin:'20px'}} />
            </div>
          </div>
          <div className="users-list">
            <div>
              <h4 style={{lineHeight:'40px'}}>Hello {userName}</h4>
              <RadioGroup onChange={this.handleChangeRadio} value={status}>
                <Radio value={1}>在线</Radio>
                <Radio value={0}>离线</Radio>
              </RadioGroup>
            </div>
            <div className="users-list-names">
              {users.map((item, i) => (
                <p key={item.name + i}>{`【${item.status ? '在线': '离线'}】 ${item.userName}`}</p>
              ))}
            </div>
          </div>
        </div>
        <style jsx>{`
          .container {
            width:800px;
            margin:0 auto;
          }
          h1 {
            text-align:center;
            padding-top:50px;
          }
          .content {
            background:#85f0f5;
            margin:20px auto;
            height:800px;
            display:flex;
            justify-content:space-between;
          }
          .message-list {
            width:600px;
            margin: 10px; 
            border:5px solid white;
          }
          .users-list {
            width:160px;
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
            height:700px;
            border:5px solid white;
          }
        `}</style>
      </div>
    );
  }
}
export default IndexPage;
