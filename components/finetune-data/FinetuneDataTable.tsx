import React, { FC, useState } from 'react';
import { mutate } from 'swr';
import { Form, Popconfirm, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FinetuneData } from '@prisma/client';
import { useRouter } from 'next/router';
import { MonacoInput } from '../MonacoInput';

interface FinetuneDataTableProps {
  finetuneData: FinetuneData[];
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

export const FinetuneDataTable: FC<FinetuneDataTableProps> = ({ finetuneData }: FinetuneDataTableProps) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [editingKey, setEditingKey] = useState(0);
  const dataSetId = Number(router.query.dataSetId);
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
      await mutate(`/api/finetune-data-sets?dataSetId=${dataSetId}`);
      await mutate(`/api/finetune-data?dataSetId=${dataSetId}`);
      await mutate(`/api/finetune-data/tokens?dataSetId=${dataSetId}`);
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

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={finetuneData}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};
