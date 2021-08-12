import React, { FC } from 'react';
import Link from 'next/link';
import { Space, Table } from 'antd';
import { FinetuneDataSet } from '@prisma/client';

interface FinetuneDataSetsTableProps {
  dataSets: FinetuneDataSet[];
}

const { Column } = Table;

export const FinetuneDataSetsTable: FC<FinetuneDataSetsTableProps> = ({ dataSets }: FinetuneDataSetsTableProps) => (
  <Table dataSource={dataSets} rowKey="id">
    <Column title="Title" dataIndex="title" key="title" />
    <Column
      title="Actions"
      key="actions"
      render={(_, record: FinetuneDataSet) => (
        <Space size="middle">
          <Link href={`/finetune-data?dataSetId=${record.id}`}>Edit</Link>
        </Space>
      )}
    />
  </Table>
);
