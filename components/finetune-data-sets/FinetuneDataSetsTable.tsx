import React, { FC } from 'react';
import Link from 'next/link';
import { Space, Table, Button, notification } from 'antd';
import { FinetuneDataSet } from '@prisma/client';
import { mutate } from 'swr';
import { FinetuneDataSetsResponse } from '../../pages/api/finetune-data-sets';

interface FinetuneDataSetsTableProps {
  dataSets: FinetuneDataSet[];
  revalidate: () => void;
}

const { Column } = Table;

export const FinetuneDataSetsTable: FC<FinetuneDataSetsTableProps> = ({ dataSets, revalidate }: FinetuneDataSetsTableProps) => (
  <Table dataSource={dataSets} rowKey="id">
    <Column title="Title" dataIndex="title" key="title" />
    <Column
      title="Actions"
      key="actions"
      align="center"
      render={(_, record: FinetuneDataSet) => (
        <Space size="middle">
          <Link href={`/finetune-data?dataSetId=${record.id}`}>Edit</Link>
          <Button
            danger
            onClick={async (): Promise<void> => {
              const response = await fetch(`/api/finetune-data-sets?dataSetId=${record.id}`, {
                method: 'DELETE',
              });

              const { message }: FinetuneDataSetsResponse = await response.json();

              if (response) {
                await Promise.all([revalidate()]);
              } else {
                notification.error({
                  message: 'Failed to delete new finetune data set.',
                  description: message,
                });
              }
            }}
          >
            Delete
          </Button>
        </Space>
      )}
    />
  </Table>
);
