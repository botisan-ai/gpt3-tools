import React, { FC } from 'react';
import { Table } from 'antd';
import { FinetuneData } from '@prisma/client';

interface FinetuneDataTableProps {
  data: FinetuneData[];
}

const { Column } = Table;

export const FinetuneDataTable: FC<FinetuneDataTableProps> = ({ data }: FinetuneDataTableProps) => (
  <Table dataSource={data} rowKey="id">
    <Column title="Prompt" dataIndex="prompt" key="prompt" />
    <Column title="Completion" dataIndex="completion" key="completion" />
  </Table>
);
