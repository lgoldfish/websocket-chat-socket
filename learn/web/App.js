import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { pathname } = window.location;
const {
  Header, Footer, Sider, Content,
} = Layout;
export default ({ children }) => (
  <Layout className="myApp" style={{ height: '100%' }}>
    <Content style={{ background: '#fff' }}>{children}</Content>
    <style global jsx>
      {`
        .myApp .ant-layout {
            height:100%;
        }
      `}
    </style>
  </Layout>
);
