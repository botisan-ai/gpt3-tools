import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse, mutate } from 'swr';
import { Typography, Form, Input, Button, Space, Modal, Spin, Divider, notification, Upload, message } from 'antd';
import { EditOutlined, DownloadOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { FinetuneData, FinetuneDataSet } from '@prisma/client';

import * as querystring from 'querystring';
import { MonacoInput } from '../components/MonacoInput';
import { AppLayout } from '../components/AppLayout';
import { FinetuneDataTable } from '../components/finetune-data/FinetuneDataTable';

import { fetcher, fetchText } from '../utils/request';
import { downloadFile } from '../utils/browser';

const { Title, Paragraph } = Typography;

interface DataSetResponse {
  dataSet: FinetuneDataSet;
}

export default function FinetuneDataPage() {
  const [templateForm] = Form.useForm();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isTemplateSubmitLoading, setIsTemplateSubmitLoading] = useState(false);
  const [isUpdateTemplateDisabled, setIsUpdateTemplateDisabled] = useState(true);
  const [isCountingTokens, setIsCountingTokens] = useState(false);

  const { dataSetId } = router.query;
  const {
    data: dataSetResponse,
    error: dataSetError,
    revalidate: revalidateDataSetResponse,
  }: SWRResponse<DataSetResponse, Error> = useSWR(() => (dataSetId ? `/api/finetune-data-sets?dataSetId=${dataSetId}` : null), fetcher);

  const {
    data: totalTokens,
    error: totalTokensError,
    revalidate: revalidateTokens,
  } = useSWR(dataSetId ? `/api/finetune-data/tokens?dataSetId=${dataSetId}` : null, fetcher);

  const dataSet = dataSetResponse?.dataSet;

  useEffect(() => {
    if (dataSet) {
      templateForm.setFieldsValue(dataSet);
    }
  }, [templateForm, dataSet]);

  if (!dataSetResponse) {
    return (
      <AppLayout>
        <Spin size="large" style={{ position: 'absolute', top: '50%', right: 'calc(50% - 150px)' }} />
      </AppLayout>
    );
  }

  if (dataSetError) {
    notification.error({
      message: 'Failed to fetch data',
      description: dataSetError,
    });
  }

  const updateValues = async (values: any) => {
    try {
      setIsTemplateSubmitLoading(true);
      console.log(values);
      await fetch('/api/finetune-data-sets', {
        method: 'PUT',
        body: JSON.stringify({
          id: Number(dataSetId),
          ...values,
        }),
      });
      setEditing(false);
      setIsTemplateSubmitLoading(false);
      setIsUpdateTemplateDisabled(true);
      await Promise.all([revalidateDataSetResponse(), revalidateTokens()]);
    } catch (err) {
      notification.error({
        message: 'Failed to update',
        description: err,
      });
    }
  };

  const downloadTemplate = async () => {
    const res = await fetchText(`/api/finetune-data-sets?dataSetId=${dataSetId}&download=true`);
    downloadFile(`${dataSet?.title}template.json`, res);
  };

  const startProcess = async () => {
    const res = await fetch(`/api/finetune-data-sets?dataSetId=${dataSetId}&start=true`);
    console.log(await res.json());
  };

  return (
    <AppLayout>
      <Head>
        <title>Finetune Data - GPT-3 Tools</title>
      </Head>
      <div className="flex flex-row justify-between">
        {!editing ? (
          <div className="flex flex-row justify-start">
            <Title className="inline-block" level={2}>
              {dataSet?.title}
            </Title>
            <a onClick={() => setEditing(!editing)}>
              <EditOutlined className="ml-2 w-6 h-6 leading-10 text-2xl" />
            </a>
          </div>
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
        <Button type="primary" onClick={() => downloadTemplate()} icon={<DownloadOutlined />} className="flex items-center">
          Download
        </Button>

        <Button type="primary" onClick={() => startProcess()} className="flex items-center">
          Start
        </Button>
      </div>

      <div className="flex flex-row justify-between mb-4">
        <Paragraph>You can set up your GPT-3 finetuning training data here.</Paragraph>
        <Paragraph strong>
          {isCountingTokens
            ? 'Counting tokens...'
            : `Total token count:
          ${totalTokens?.total}`}
        </Paragraph>
      </div>

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
          <div className="container mx-auto flex flex-col max-w-1/2">
            <Title level={4}>Prompt Template</Title>
            <Form.Item name="promptTemplate">
              <MonacoInput setIsUpdateTemplateDisabled={setIsUpdateTemplateDisabled} />
            </Form.Item>
          </div>
          <div className="container mx-auto flex flex-col max-w-1/2">
            <Title level={4}>Completion Template</Title>
            <Form.Item name="completionTemplate">
              <MonacoInput setIsUpdateTemplateDisabled={setIsUpdateTemplateDisabled} />
            </Form.Item>
          </div>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isTemplateSubmitLoading} disabled={isUpdateTemplateDisabled}>
            Update Template
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <FinetuneDataTable
        revalidateDataSetResponse={revalidateDataSetResponse}
        revalidateTokens={revalidateTokens}
        setIsCountingTokens={setIsCountingTokens}
      />
    </AppLayout>
  );
}
