import { NextApiRequest, NextApiResponse } from 'next';

import { PrismaClient, FinetuneDataSet } from '@prisma/client';

const prisma = new PrismaClient();

export interface FinetuneDataTokensResponse {
  total?: number;
  message?: string;
}

interface DataTokenCountResponse {
  id: number;
  promptTokenCount: number;
  completionTokenCount: number;
}

async function getTotalTokensCount(
  dataSetId: string,
  {
    batchSize,
    promptTemplateTokenCount,
    completionTemplateTokenCount,
  }: {
    batchSize: number;
    promptTemplateTokenCount: number;
    completionTemplateTokenCount: number;
  },
) {
  let cursorId: number;

  let total = 0;
  const dataTokenCount = await prisma.finetuneData.findMany({
    where: {
      dataSetId: Number(dataSetId),
    },
    select: {
      id: true,
      promptTokenCount: true,
      completionTokenCount: true,
    },
  });

  const totalTemplateTokens = dataTokenCount.length * (promptTemplateTokenCount + completionTemplateTokenCount);

  while (true) {
    try {
      const dataTokenCountResp: DataTokenCountResponse[] = await prisma.finetuneData.findMany({
        take: batchSize,
        skip: cursorId ? 1 : 0,
        cursor: cursorId ? { id: cursorId } : undefined,
        where: {
          dataSetId: Number(dataSetId),
        },
        select: {
          id: true,
          promptTokenCount: true,
          completionTokenCount: true,
        },
      });

      if (dataTokenCountResp.length === 0) {
        return total + totalTemplateTokens;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const item of dataTokenCountResp) {
        total += item.promptTokenCount + item.completionTokenCount;
      }

      cursorId = dataTokenCountResp[dataTokenCountResp.length - 1].id;
    } catch (err) {
      console.log(err);
    }
  }
}

export default async function finetuneDataTokensApi(req: NextApiRequest, res: NextApiResponse<FinetuneDataTokensResponse>): Promise<void> {
  try {
    if (req.method === 'GET' && req.query.dataSetId) {
      const dataSet = await prisma.finetuneDataSet.findFirst({
        where: {
          id: Number(req.query.dataSetId),
        },
      });

      const total = await getTotalTokensCount(req.query.dataSetId as string, {
        batchSize: 10000,
        promptTemplateTokenCount: Number(dataSet?.promptTemplateTokenCount),
        completionTemplateTokenCount: Number(dataSet?.completionTemplateTokenCount),
      });

      res.status(200).json({ total });
      //
    }
  } catch (e) {
    res.statusCode = 400;
    res.json({ message: (e as Error).message });
  }
}
