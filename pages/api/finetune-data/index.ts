import type { NextApiRequest, NextApiResponse } from 'next';
import { encode } from 'gpt-3-encoder';

import { PrismaClient, FinetuneData } from '@prisma/client';

const prisma = new PrismaClient();

export interface FinetuneDataResponse {
  data?: FinetuneData[];
  newData?: FinetuneData;
  updateData?: FinetuneData;
  message?: string;
  count?: number;
}

export default async function finetuneDataApi(req: NextApiRequest, res: NextApiResponse<FinetuneDataResponse>): Promise<void> {
  try {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body);
      const { dataSetId } = data;
      const promptTokenCount = encode(data.prompt).length;
      const completionTokenCount = encode(data.completion).length;

      if (!dataSetId) {
        throw new Error('dataSetId is required');
      }
      const response = await prisma.finetuneData.create({
        data: {
          promptTokenCount,
          completionTokenCount,
          ...data,
        },
      });

      res.statusCode = 200;
      res.json({ newData: response });
      return;
    }
    if (req.method === 'PUT') {
      const data = JSON.parse(req.body);
      const { id, dataSetId } = data;
      let promptTokenCount = 0;
      let completionTokenCount = 0;
      if (data.prompt) {
        promptTokenCount = encode(data.prompt).length;
      }
      if (data.completion) {
        completionTokenCount = encode(data.completion).length;
      }

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
        data: {
          promptTokenCount,
          completionTokenCount,
          ...data,
        },
      });

      res.statusCode = 200;
      res.json({ updateData: response });
    } /* req.method === 'GET' */ else if (req.query.dataSetId) {
      const skip = Number(req.query?.skip || 0);
      const take = Number(req.query?.take || 10);

      const count = await prisma.finetuneData.count({
        where: {
          dataSetId: Number(req.query.dataSetId),
        },
      });
      const data = await prisma.finetuneData.findMany({
        where: {
          dataSetId: Number(req.query.dataSetId),
        },
        skip: Number(skip),
        take: Number(take),
      });

      res.statusCode = 200;
      res.json({ data, count });
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
