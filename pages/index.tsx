import React from 'react';
import Head from 'next/head';

import { Typography } from 'antd';

import { AppLayout } from '../components/AppLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage() {
  return (
    <AppLayout>
      <Head>
        <title>GPT-3 Tools</title>
      </Head>
      <Title level={2}>Hello!</Title>
      <Paragraph>This is a UI Tool for GPT-3.</Paragraph>
    </AppLayout>
  );
}
