import type { NextApiRequest, NextApiResponse } from 'next';

import { PrismaClient, FinetuneDataSet } from '@prisma/client';

const prisma = new PrismaClient();

export interface FinetuneDataSetsResponse {
  dataSet?: FinetuneDataSet | null;
  dataSets?: FinetuneDataSet[];
  newDataSet?: FinetuneDataSet;
  updateDataSet?: FinetuneDataSet;
  message?: string;
}

export default async function finetuneDataSetsApi(req: NextApiRequest, res: NextApiResponse<FinetuneDataSetsResponse>): Promise<void> {
  try {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body);
      const response = await prisma.finetuneDataSet.create({
        data,
      });
      res.json({ newDataSet: response });
    } else if (req.method === 'PUT') {
      const data = JSON.parse(req.body);
      const { id } = data;

      if (!id) {
        throw new Error('id is required');
      }

      const response = await prisma.finetuneDataSet.update({
        where: {
          id,
        },
        data,
      });

      res.statusCode = 200;
      res.json({ updateDataSet: response });
    } /* req.method === 'GET' */ else if (req.query.dataSetId) {
      const dataSet = await prisma.finetuneDataSet.findFirst({
        where: {
          id: Number(req.query.dataSetId),
        },
      });
      res.statusCode = 200;
      res.json({ dataSet });
    } else {
      const dataSets = await prisma.finetuneDataSet.findMany();
      res.statusCode = 200;
      res.json({ dataSets });
    }
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: (e as Error).message });
  }
}
