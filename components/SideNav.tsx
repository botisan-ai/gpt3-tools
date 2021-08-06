import React, { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import { HomeOutlined, UserOutlined, BookOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Sider: AntSider } = Layout;

const Logo = styled.div`
  height: 32px;
  margin: 16px;
  color: white;
  //background: rgba(255, 255, 255, 0.2);
`;

const Sider = styled(AntSider)`
  z-index: 2000;
`;

interface SideNavProps {
  selected: string;
  collapsed: boolean;
  setCollapsed: (bool: boolean) => void;
}

export const SideNav: FC<SideNavProps> = ({ selected, collapsed, setCollapsed }: SideNavProps) => (
  <Sider
    collapsible
    collapsed={collapsed}
    onCollapse={() => setCollapsed(!collapsed)}
    style={{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
    }}
  >
    <Logo>X-Tech</Logo>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[selected]}>
      <Menu.Item key="/" icon={<HomeOutlined />}>
        <Link href="/">Home</Link>
      </Menu.Item>
      {/* <Menu.Item key="/search" icon={<SearchOutlined />}>
        <Link href="/search">Search</Link>
      </Menu.Item> */}
    </Menu>
  </Sider>
);
