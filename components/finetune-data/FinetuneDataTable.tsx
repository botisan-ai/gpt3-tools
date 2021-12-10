import React, { Dispatch, FC, SetStateAction, useState, useEffect } from 'react';
import useSWR, { mutate, SWRResponse } from 'swr';
import { Button, Form, Modal, notification, Popconfirm, Spin, Table, TablePaginationConfig, Typography, Upload, UploadProps } from 'antd';
import { FinetuneData } from '@prisma/client';
import { useRouter } from 'next/router';
import * as querystring from 'querystring';
import { UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { MonacoInput } from '../MonacoInput';
import { fetcher } from '../../utils/request';

const { Title, Paragraph } = Typography;

interface IFinetuneDataTableProps {
  setIsCountingTokens: Dispatch<SetStateAction<boolean>>;
  revalidateDataSetResponse: () => Promise<any>;
  revalidateTokens: () => Promise<any>;
}

interface DataResponse {
  data: FinetuneData[];
  count: number;
}

interface Item {
  id: number;
  prompt: string;
  completion: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => (
  <td {...restProps}>
    {editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: `Please Input ${title}!`,
          },
        ]}
      >
        <MonacoInput />
      </Form.Item>
    ) : (
      children
    )}
  </td>
);

export const FinetuneDataTable = ({ setIsCountingTokens, revalidateDataSetResponse, revalidateTokens }: IFinetuneDataTableProps) => {
  const [form] = Form.useForm();
  const [addRowForm] = Form.useForm();
  const router = useRouter();
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  const [editingKey, setEditingKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // Upload calls onChange 2 times. This helps open notification 1 time only
  const [warnNotificationOpen, setWarnNotificationOpen] = useState(0);

  const { dataSetId, page = 1, pageSize = 10 } = router.query;
  const {
    data: dataResponse,
    error: dataError,
    revalidate: revalidateDataResponse,
  }: SWRResponse<DataResponse, Error> = useSWR(
    () => (dataSetId
      ? `/api/finetune-data?${querystring.stringify({ dataSetId, skip: (Number(page) - 1) * Number(pageSize), take: Number(pageSize) })}`
      : null),
    fetcher,
  );

  useEffect(() => {
    if (isUploading && warnNotificationOpen === 1) {
      openNotification();
    }
  }, [isUploading, warnNotificationOpen]);

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: number }) => {
    form.setFieldsValue({ prompt: record.prompt, completion: record.completion, ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const row = await form.validateFields();
      setEditingKey(0);

      await fetch('/api/finetune-data', {
        method: 'PUT',
        body: JSON.stringify({
          dataSetId,
          id,
          ...row,
        }),
      });
      await Promise.all([revalidateDataSetResponse(), revalidateDataResponse(), revalidateTokens()]);
      setEditingKey(0);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      editable: true,
      render: (c: string) => <pre>{c}</pre>,
      ellipsis: true,
    },
    {
      title: 'Completion',
      dataIndex: 'completion',
      editable: true,
      render: (c: string) => <pre>{c}</pre>,
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '200px',
      align: 'center',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a href="javascript:;" onClick={() => save(record.id)} style={{ marginRight: 8 }}>
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={!!editingKey} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const openNotification = () => {
    const args = {
      message: 'Warning',
      description: (
        <div>
          <Paragraph>The CSV file is uploading. Please do not leave this page.</Paragraph>
          <Paragraph>If you leave before CSV file finishes uploading, your changes will be lost.</Paragraph>
        </div>
      ),
      duration: 0,
      icon: <WarningOutlined style={{ color: '#f81d22' }} />,
    };
    notification.open(args);
  };

  const uploadCsvProps: UploadProps = {
    name: 'file',
    action: `/api/finetune-data/upload?dataSetId=${dataSetId}`,
    headers: {
      authorization: 'authorization-text',
    },
    async onChange(info: any) {
      console.log(info.file.status, isUploading);

      if (info.file.status === 'uploading') {
        setIsUploading(true);
        setWarnNotificationOpen(warnNotificationOpen + 1);
      }

      if (info.file.status === 'done') {
        notification.success({
          message: (
            <div>
              <Paragraph>
                {info.file.name}
                {' '}
                file uploaded successfully.
              </Paragraph>
              <Paragraph>Tokens counting... You can leave the page</Paragraph>
            </div>
          ),
        });
        setIsCountingTokens(true);
        await Promise.all([revalidateDataSetResponse(), revalidateDataResponse(), revalidateTokens()]);
        setIsCountingTokens(false);
        setIsUploading(false);
        setWarnNotificationOpen(0);
      } else if (info.file.status === 'error') {
        notification.error({ message: `${info.file.name} file upload failed.` });
        setIsUploading(false);
        setWarnNotificationOpen(0);
      }
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => `${parseFloat(Number(percent).toFixed(2))}%`,
    },
    showUploadList: false,
    accept: '.csv',
  };

  function onTableChange(pagination: TablePaginationConfig) {
    cancel();
    return router.push(
      `/finetune-data?${querystring.stringify({ dataSetId, page: pagination.current, pageSize: pagination.pageSize })}`,
      `/finetune-data?${querystring.stringify({ dataSetId, page: pagination.current, pageSize: pagination.pageSize })}`,
      {
        shallow: true,
      },
    );
  }

  return (
    <div className="flex flex-col justify-start">
      <div className="flex justify-between">
        <Title className="inline-block" level={3}>
          Finetune Data
        </Title>
        <div>
          <Button type="default" onClick={() => setIsOpenEditModal(true)}>
            Add Row
          </Button>
          <Upload {...uploadCsvProps}>
            <Button icon={<UploadOutlined />} style={{ marginLeft: '20px' }} loading={isUploading}>
              Upload CSV
            </Button>
          </Upload>
        </div>
      </div>
      <Form form={form} component={false}>
        {dataResponse ? (
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            rowKey={(record) => record.id}
            dataSource={dataResponse?.data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              total: dataResponse?.count || 0,
              pageSize: +pageSize,
              current: +page,
            }}
            onChange={onTableChange}
          />
        ) : (
          <Spin size="large" />
        )}
      </Form>
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
            await Promise.all([revalidateDataSetResponse(), revalidateDataResponse(), revalidateTokens()]);

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
    </div>
  );
};
