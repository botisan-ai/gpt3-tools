import React, { FC } from 'react';
import Link from 'next/link';
import { Layout, Menu } from 'antd';
import { HomeOutlined, BookOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface SideNavProps {
  selected: string;
  collapsed: boolean;
  setCollapsed: (bool: boolean) => void;
}

export const SideNav: FC<SideNavProps> = ({ selected, collapsed, setCollapsed }: SideNavProps) => (
  <Sider
    className="z-50"
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
    <div className="h-8 m-4 text-white">GPT-3 Tools</div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[selected]}>
      <Menu.Item key="/" icon={<HomeOutlined />}>
        <Link href="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="/finetune-data-sets" icon={<BookOutlined />}>
        <Link href="/finetune-data-sets">Finetune Data Sets</Link>
      </Menu.Item>
    </Menu>
  </Sider>
);
