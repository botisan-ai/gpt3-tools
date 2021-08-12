import React from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typography, Button, Spin, notification } from 'antd';

import { FinetuneDataSetsResponse } from './api/finetune-data-sets';
import { fetcher } from '../utils/request';

import { AppLayout } from '../components/AppLayout';
import { FinetuneDataSetsTable } from '../components/finetune-data-sets/FinetuneDataSetsTable';

const { Title, Paragraph } = Typography;

export default function FinetuneDataSetsPage() {
  const router = useRouter();
  const { data, error } = useSWR('/api/finetune-data-sets', fetcher);

  return (
    <AppLayout>
      <Head>
        <title>Finetune Data Sets - GPT-3 Tools</title>
        <link rel="preload" href="/api/finetune-data-sets" as="fetch" crossOrigin="anonymous" />
      </Head>
      <Title level={2}>Finetune Data Sets</Title>
      <Paragraph>Here are all the finetune data sets in the system.</Paragraph>
      <Paragraph>
        <Button
          className="mt-2 mb-2"
          type="primary"
          onClick={async (): Promise<void> => {
            const response = await fetch('/api/finetune-data-sets', {
              method: 'POST',
              body: JSON.stringify({
                title: 'New Finetune Data Set',
              }),
            });

            const { newDataSet, message }: FinetuneDataSetsResponse = await response.json();

            if (newDataSet) {
              await router.push(`/finetune-data?dataSetId=${newDataSet.id}`);
            } else {
              notification.error({
                message: 'Failed to create new finetune data set.',
                description: message,
              });
            }
          }}
        >
          New Data Set
        </Button>
      </Paragraph>
      {data ? <FinetuneDataSetsTable dataSets={data.dataSets} /> : error ? <pre>{JSON.stringify(error, null, 2)}</pre> : <Spin size="large" />}
    </AppLayout>
  );
}
