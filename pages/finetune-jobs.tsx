import React from 'react';
import useSWR, { SWRResponse } from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Typography, Button, Spin, notification, Table } from 'antd';

import { ColumnsType } from 'antd/lib/table';
import { FinetuneDataSetsResponse } from './api/finetune-data-sets';
import { fetcher, fetchText } from '../utils/request';

import { AppLayout } from '../components/AppLayout';
import { FinetuneDataSetsTable } from '../components/finetune-data-sets/FinetuneDataSetsTable';
import { getDate } from '../utils/utils';

const { Title, Paragraph } = Typography;

interface FinetuneJobsResponse {
  id: string;
  object: 'fine-tune' | string;
  fine_tuned_model: string;
  model: string;
  organization_id: string;
  status: string;
  validation_files: any[];
  created_at: Date;
  updated_at: Date;
  hyperparams: {
    batch_size: number;
    learning_rate_multiplier: number;
    n_epochs: number;
    prompt_loss_weight: number;
    use_packing: null | any;
    weight_decay: number;
  }[];
  result_files: {
    bytes: number;
    created_at: Date;
    filename: string;
    id: string;
    object: 'file' | string;
    purpose: string;
    status: string;
    status_details: null | any;
  }[];
  training_files: {
    bytes: number;
    created_at: Date;
    filename: string;
    id: string;
    object: 'file';
    purpose: string;
    status: string;
    status_details: null | any;
  }[];
}

export default function FinetuneJobsPage() {
  const { data, error }: SWRResponse<FinetuneJobsResponse[], Error> = useSWR('/api/finetune-jobs', fetcher);

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

  function getStatusColor(status: string) {
    return status === 'succeeded' ? '#0b8235' : 'failed' ? '#f81d22' : '#faad14';
  }

  const columns: ColumnsType<FinetuneJobsResponse> = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: 'Created at',
      key: 'created_at',
      dataIndex: 'created_at',
      render: (_, record) => getDate(Number(record.created_at)),
      align: 'center',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => <span style={{ color: getStatusColor(record.status) }}>{record.status}</span>,
      align: 'center',
    },
    {
      title: 'Finetuned model',
      key: 'fine_tuned_model',
      dataIndex: 'fine_tuned_model',
      align: 'center',
    },
    {
      title: 'Training files',
      key: 'training_files',
      dataIndex: 'training_files',
      render: (_, record) => record.training_files.map((file) => file.filename),
      align: 'center',
    },
    {
      title: 'Result files',
      key: 'result_files',
      dataIndex: 'result_files',
      render: (_, record) => record.result_files.map((file) => file.filename),
      align: 'center',
    },
  ];

  return (
    <AppLayout>
      <Head>
        <title>FinetuneJobs - GPT-3 Tools</title>
        <link rel="preload" href="/api/finetune-jobs" as="fetch" crossOrigin="anonymous" />
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title level={2}>Finetune Jobs</Title>
          <Paragraph>Here are all the Finetune Jobs in the system.</Paragraph>
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
