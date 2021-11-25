import React from 'react';
import useSWR, { SWRResponse } from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typography, Button, Spin, notification, Table, Space } from 'antd';

import { ColumnsType } from 'antd/lib/table';
import { FinetuneDataSetsResponse } from './api/finetune-data-sets';
import { fetcher, fetchText } from '../utils/request';

import { AppLayout } from '../components/AppLayout';
import { FinetuneDataSetsTable } from '../components/finetune-data-sets/FinetuneDataSetsTable';
import { getDate } from '../utils/utils';

const { Title, Paragraph } = Typography;

interface ModelsResponse {
  id: string;
  object: 'model' | string;
  created: Date;
  owned_by: string;
  root: string;
  parent: string;
  permission: {
    allow_create_engine: boolean;
    allow_fine_tuning: boolean;
    allow_logprobs: boolean;
    allow_sampling: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    created: Date;
    id: string;
    object: 'snapshot_permission' | string;
  }[];
}

export default function ModelsPage() {
  const { data, error }: SWRResponse<ModelsResponse[], Error> = useSWR('/api/models', fetcher);

  if (!data) {
    return (
      <AppLayout>
        <Spin size="large" style={{ position: 'absolute', top: '50%', right: 'calc(50% - 150px)' }} />
      </AppLayout>
    );
  }
  console.log(data);
  if (error) {
    console.log(error);
  }
  const columns: ColumnsType<ModelsResponse> = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: 'Created at',
      key: 'created_at',
      dataIndex: 'created',
      render: (_, record) => getDate(Number(record.created)),
      align: 'center',
    },
    {
      title: 'Root',
      key: 'root',
      dataIndex: 'root',
      align: 'center',
    },
    {
      title: 'Owned by',
      key: 'owned_by',
      dataIndex: 'owned_by',
      align: 'center',
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>Models - GPT-3 Tools</title>
        <link rel="preload" href="/api/models" as="fetch" crossOrigin="anonymous" />
      </Head>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title level={2}>Models</Title>
          <Paragraph>Here are all the models in the system.</Paragraph>
        </div>
        <Title level={5}>
          Total:
          {data?.length}
        </Title>
      </div>

      {data ? (
        <Table
          dataSource={data || []}
          columns={columns}
          rowKey="id"
          // pagination={{
          //   total: countData?.count || 0,
          //   pageSize: +pageSize,
          //   current: +page,
          //   style: { padding: '16px' },
          // }}
          // onChange={onTableChange}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
        />
      ) : (
        <Spin size="large" />
      )}
    </AppLayout>
  );
}
