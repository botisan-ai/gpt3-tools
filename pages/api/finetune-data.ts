import type { NextApiRequest, NextApiResponse } from 'next';

import { PrismaClient, FinetuneData } from '@prisma/client';

const prisma = new PrismaClient();

export interface FinetuneDataResponse {
  data?: FinetuneData[];
  newData?: FinetuneData;
  updateData?: FinetuneData;
  message?: string;
}

export default async function finetuneDataApi(req: NextApiRequest, res: NextApiResponse<FinetuneDataResponse>): Promise<void> {
  try {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body);
      const { dataSetId } = data;

      if (!dataSetId) {
        throw new Error('dataSetId is required');
      }
      const response = await prisma.finetuneData.create({
        data,
      });

      res.statusCode = 200;
      res.json({ data: response });
      return;
    }
    if (req.method === 'PUT') {
      const data = JSON.parse(req.body);
      const { id, dataSetId } = data;

      if (!id) {
        throw new Error('id is required');
      }

      if (!dataSetId) {
        throw new Error('dataSetId is required');
      }

      const response = await prisma.finetuneData.update({
        where: {
          id,
        },
        data,
      });

      res.statusCode = 200;
      res.json({ updateData: response });
    } /* req.method === 'GET' */ else if (req.query.dataSetId) {
      const data = await prisma.finetuneData.findMany({
        where: {
          dataSetId: Number(req.query.dataSetId),
        },
      });
      res.statusCode = 200;
      res.json({ data });
    } else {
      const data = await prisma.finetuneData.findMany();
      res.statusCode = 200;
      res.json({ data });
    }
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: (e as Error).message });
  }
}
