import React, { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { Typography, Form, Input, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { MonacoInput } from '../components/MonacoInput';
import { AppLayout } from '../components/AppLayout';
import { FinetuneDataTable } from '../components/finetune-data/FinetuneDataTable';

import { fetcher } from '../utils/request';

const { Title, Paragraph } = Typography;

export default function FinetuneDataPage() {
  const [templateForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const dataSetId = Number(router.query.dataSetId);

  const { data: dataSetResponse, error: dataSetError } = useSWR(() => (dataSetId ? `/api/finetune-data-sets?dataSetId=${dataSetId}` : null), fetcher);
  const { data: dataResponse, error: dataError } = useSWR(() => (dataSetId ? `/api/finetune-data?dataSetId=${dataSetId}` : null), fetcher);

  const dataSet = dataSetResponse?.dataSet;
  const data = dataResponse?.data;

  useEffect(() => {
    templateForm.setFieldsValue(dataSet);
  }, [templateForm, dataSet]);

  const updateValues = async (values: any) => {
    await fetch('/api/finetune-data-sets', {
      method: 'PUT',
      body: JSON.stringify({
        id: dataSetId,
        ...values,
      }),
    });
    setEditing(false);
    await mutate(`/api/finetune-data-sets?dataSetId=${dataSetId}`);
    await mutate('/api/finetune-data-sets');
  };

  return (
    <AppLayout>
      <Head>
        <title>Finetune Data - GPT-3 Tools</title>
      </Head>
      <div className="flex flex-row justify-start">
        {!editing ? (
          <>
            <Title className="inline-block" level={2}>
              {dataSet?.title}
            </Title>
            <a onClick={() => setEditing(!editing)}>
              <EditOutlined className="ml-2 w-6 h-6 leading-10 text-2xl" />
            </a>
          </>
        ) : (
          <Form layout="inline" name="data-set-title" initialValues={{ title: dataSet?.title }} onFinish={updateValues}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Data Set Title" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </div>
      <Paragraph>You can set up your GPT-3 finetuning training data here.</Paragraph>

      <Form
        form={templateForm}
        name="data-set-prompt-completion-template"
        initialValues={{
          promptTemplate: dataSet?.promptTemplate,
          completionTemplate: dataSet?.completionTemplate,
        }}
        onFinish={updateValues}
      >
        <div className="container mx-auto flex flex-row">
          <div className="container mx-auto flex flex-col">
            <Title level={4}>Prompt Template</Title>
            <Form.Item name="promptTemplate">
              <MonacoInput />
            </Form.Item>
          </div>
          <div className="container mx-auto flex flex-col">
            <Title level={4}>Completion Template</Title>
            <Form.Item name="completionTemplate">
              <MonacoInput />
            </Form.Item>
          </div>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Template
          </Button>
        </Form.Item>
      </Form>

      <div className="flex flex-col justify-start">
        <div>
          <Button
            type="default"
            onClick={async () => {
              await fetch(`/api/finetune-data?dataSetId=${dataSetId}`, {
                method: 'POST',
                body: JSON.stringify({
                  dataSetId,
                  prompt: 'prompt',
                  completion: 'completion',
                }),
              });
              await mutate(`/api/finetune-data?dataSetId=${dataSetId}`);
            }}
          >
            Add Row
          </Button>
        </div>
        <FinetuneDataTable data={data} />
      </div>
    </AppLayout>
  );
}
