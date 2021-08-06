import React from 'react';
import { AppLayout } from '../components/AppLayout';

export default function Home() {
  return (
    <AppLayout>
      <h2 style={{ padding: '5px' }}>Hello!</h2>
      <p style={{ padding: '5px' }}>This is a UI Starter for NextJS using Ant Design and styled-components.</p>
    </AppLayout>
  );
}
