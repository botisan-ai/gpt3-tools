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

const AppContent = styled(Content)`
  padding-bottom: 70px;
`;

const AppFooter = styled(Layout)`
  position: fixed;
  bottom: 0px;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
      <Layout>
        <AppContent>
          <ContentContainer>{children}</ContentContainer>
        </AppContent>
        <AppFooter style={{ textAlign: 'center', paddingRight: collapsed ? '80px' : '200px' }}>Made with &lt;3 by X-Tech in 2021</AppFooter>
      </Layout>
    </MainContainer>
  );
};
