import React, { FC, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';
import { useRouter } from 'next/router';

import { SideNav } from './SideNav';

const { Content, Footer } = Layout;

const MainContainer = styled(Layout)`
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  //padding: 24px;
  min-height: 360px;

  .ant-tabs-nav {
    margin: 0;
  }
`;

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children }: AppLayoutProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <MainContainer style={{ marginLeft: collapsed ? '80px' : '200px' }}>
      <SideNav selected={router.pathname} collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className="bg-white">
        <Content className="p-4 pb-20">
          <ContentContainer>{children}</ContentContainer>
        </Content>
        <Footer
          className="footer w-full h-20 flex text-center items-center justify-center fixed bottom-0"
          style={{ paddingRight: collapsed ? '80px' : '200px' }}
        >
          Made with &lt;3 by X-Tech in 2021
        </Footer>
      </Layout>
    </MainContainer>
  );
};
