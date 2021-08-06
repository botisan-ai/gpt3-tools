import React from 'react';
import Head from 'next/head';
import { AppLayout } from '../components/AppLayout';

export default function IndexPage() {
  return (
    <AppLayout>
      <Head>
        <title>GPT-3 Tools</title>
      </Head>
      <h2 style={{ padding: '5px' }}>Hello!</h2>
      <p style={{ padding: '5px' }}>This is a UI Tool for GPT-3.</p>
    </AppLayout>
  );
}
