import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR, { SWRResponse, mutate } from 'swr';
import { Typography, Form, Input, Button, Space, Modal, Spin, Divider, notification } from 'antd';
import { EditOutlined, DownloadOutlined } from '@ant-design/icons';

import { MonacoInput } from '../components/MonacoInput';
import { AppLayout } from '../components/AppLayout';
import { FinetuneDataTable } from '../components/finetune-data/FinetuneDataTable';

import { fetcher, fetchText } from '../utils/request';
import { downloadFile } from '../utils/browser';

const { Title, Paragraph } = Typography;

interface DataSetResponse {
  dataSet: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    promptTemplate: string;
    completionTemplate: string;
    totalTokenCount: number | null;
  };
}

interface DataResponse {
  data: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    dataSetId: number;
    completion: string;
    prompt: string;
    promptTokenCount: number;
    completionTokenCount: number;
  }[];
}

export default function FinetuneDataPage() {
  const [templateForm] = Form.useForm();
  const [addRowForm] = Form.useForm();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isTemplateSubmitLoading, setIsTemplateSubmitLoading] = useState(false);
  const [isUpdateTemplateDisabled, setIsUpdateTemplateDisabled] = useState(true);

  const dataSetId = Number(router.query.dataSetId);

  const { data: dataSetResponse, error: dataSetError }: SWRResponse<DataSetResponse, Error> = useSWR(
    () => (dataSetId ? `/api/finetune-data-sets?dataSetId=${dataSetId}` : null),
    fetcher,
  );
  const { data: dataResponse, error: dataError }: SWRResponse<DataResponse, Error> = useSWR(
    () => (dataSetId ? `/api/finetune-data?dataSetId=${dataSetId}` : null),
    fetcher,
  );

  const { data: totalTokens, error: totalTokensError } = useSWR(dataSetId ? `/api/finetune-data/tokens?dataSetId=${dataSetId}` : null, fetcher);

  const dataSet = dataSetResponse?.dataSet;
  const originData = dataResponse?.data;

  useEffect(() => {
    if (dataSet) {
      templateForm.setFieldsValue(dataSet);
    }
  }, [templateForm, dataSet]);

  if (!dataSetResponse) {
    return (
      <AppLayout>
        <Spin size="large" />
      </AppLayout>
    );
  }

  if (dataSetError || dataError) {
    notification.error({
      message: 'Failed to fetch data',
      description: dataSetError ?? dataError,
    });
  }

  const updateValues = async (values: any) => {
    try {
      setIsTemplateSubmitLoading(true);
      await fetch('/api/finetune-data-sets', {
        method: 'PUT',
        body: JSON.stringify({
          id: dataSetId,
          ...values,
        }),
      });
      setEditing(false);
      setIsTemplateSubmitLoading(false);
      setIsUpdateTemplateDisabled(true);
      await mutate(`/api/finetune-data-sets?dataSetId=${dataSetId}`);
      await mutate('/api/finetune-data-sets');
      await mutate(`/api/finetune-data/tokens?dataSetId=${dataSetId}`);
    } catch (err) {
      notification.error({
        message: 'Failed to update',
        description: err,
      });
    }
  };

  if (!dataSetResponse || !dataResponse) {
    return 'loading';
  }

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
          Total token count:
          {totalTokens?.total}
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

      <div className="flex flex-col justify-start">
        <div className="flex justify-between">
          <Title className="inline-block" level={3}>
            Finetune Data
          </Title>
          <Button type="default" onClick={() => setIsOpenEditModal(true)}>
            Add Row
          </Button>
        </div>

        <FinetuneDataTable finetuneData={originData} />
      </div>

      <Modal
        title="Add row"
        visible={isOpenEditModal}
        onOk={async () => {
          try {
            await fetch(`/api/finetune-data?dataSetId=${dataSetId}`, {
              method: 'POST',
              body: JSON.stringify({
                dataSetId,
                ...addRowForm.getFieldsValue(),
              }),
            });
            await mutate(`/api/finetune-data?dataSetId=${dataSetId}`);
            await mutate(`/api/finetune-data-sets?dataSetId=${dataSetId}`);

            addRowForm.resetFields();
            setIsOpenEditModal(false);
          } catch (err) {
            notification.error({
              message: 'Failed to add row',
              description: err,
            });
          }
        }}
        onCancel={() => setIsOpenEditModal(false)}
        getContainer={false}
      >
        <Form form={addRowForm}>
          <Form.Item label="Prompt" name="prompt">
            <MonacoInput />
          </Form.Item>
          <Form.Item label="Completion" name="completion">
            <MonacoInput />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}
