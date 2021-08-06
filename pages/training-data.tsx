import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Row, Col } from 'antd';

import { AppLayout } from '../components/AppLayout';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function TrainingDataPage() {
  return (
    <AppLayout>
      <Head>
        <title>Training Data - GPT-3 Tools</title>
      </Head>
      <h2 style={{ padding: '5px' }}>Training Data</h2>
      <Row>
        <Col span={12}>
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
              lineNumbers: false,
            }}
            defaultLanguage="handlebars"
            height="100px"
            onChange={(value) => console.log(value)}
          />
        </Col>
        <Col span={12}>
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
              lineNumbers: false,
            }}
            defaultLanguage="handlebars"
            height="100px"
            onChange={(value) => console.log(value)}
          />
        </Col>
      </Row>
    </AppLayout>
  );
}
