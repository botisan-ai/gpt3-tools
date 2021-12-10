import React from 'react';
import useSWR, { SWRResponse } from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typography, Button, Spin, notification } from 'antd';

import { FinetuneDataSetsResponse } from './api/finetune-data-sets';
import { fetcher, fetchText } from '../utils/request';

import { AppLayout } from '../components/AppLayout';
import { FinetuneDataSetsTable } from '../components/finetune-data-sets/FinetuneDataSetsTable';

const { Title, Paragraph } = Typography;

interface DataSetResponse {
  dataSets: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    promptTemplate: string;
    completionTemplate: string;
  };
}

export default function FinetuneDataSetsPage() {
  const router = useRouter();
  const { data, error, revalidate }: SWRResponse<DataSetResponse, Error> = useSWR('/api/finetune-data-sets', fetcher);

  if (!data) {
    return (
      <AppLayout>
        <Spin size="large" />
      </AppLayout>
    );
  }

  if (error) {
    console.log(error);
  }

  const handleCreateNewDataSet = async () => {
    const response = await fetch('/api/finetune-data-sets', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Finetune Data Set',
      }),
    });

    const { newDataSet, message }: FinetuneDataSetsResponse = await response.json();
    await revalidate();
    if (newDataSet) {
      await router.push(`/finetune-data?dataSetId=${newDataSet.id}`);
    } else {
      notification.error({
        message: 'Failed to create new finetune data set.',
        description: message,
      });
    }
  };

  return (
    <AppLayout>
      <Head>
        <title>Finetune Data Sets - GPT-3 Tools</title>
        <link rel="preload" href="/api/finetune-data-sets" as="fetch" crossOrigin="anonymous" />
      </Head>
      <Title level={2}>Finetune Data Sets</Title>
      <Paragraph>Here are all the finetune data sets in the system.</Paragraph>

      <Paragraph>
        <Button className="mt-2 mb-2" type="primary" onClick={() => handleCreateNewDataSet()}>
          New Data Set
        </Button>
      </Paragraph>

      {data ? (
        <FinetuneDataSetsTable dataSets={data.dataSets} revalidate={revalidate} />
      ) : error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : (
        <Spin size="large" />
      )}
    </AppLayout>
  );
}
