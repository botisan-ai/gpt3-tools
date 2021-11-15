import type { NextApiRequest, NextApiResponse } from 'next';
import Handlebars from 'handlebars';
import { encode } from 'gpt-3-encoder';

import { PrismaClient, FinetuneDataSet } from '@prisma/client';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export interface FinetuneDataSetsResponse {
  dataSet?: FinetuneDataSet | null;
  dataSets?: FinetuneDataSet[];
  newDataSet?: FinetuneDataSet;
  updateDataSet?: FinetuneDataSet;
  deletedDataSet?: FinetuneDataSet;
  message?: string;
  exportTemplate?: string;
}

function createFinetuneDataStream(dataSetId: number, { batchSize, templates: { prompt, completion } }: any) {
  let cursorId: number;

  return new Readable({
    objectMode: true,
    async read() {
      try {
        const items = await prisma.finetuneData.findMany({
          take: batchSize,
          skip: cursorId ? 1 : 0,
          cursor: cursorId ? { id: cursorId } : undefined,
          where: {
            dataSetId: Number(dataSetId),
          },
        });

        if (items.length === 0) {
          this.push(null);
        } else {
          // eslint-disable-next-line no-restricted-syntax
          for (const item of items) {
            this.push(`${JSON.stringify({ prompt: prompt({ prompt: item.prompt }), completion: completion({ completion: item.completion }) })}\n`);
          }

          cursorId = items[items.length - 1].id;
        }
      } catch (err) {
        (this as any).destroy(err);
      }
    },
  });
}

const getTemplateTokenCount = (str: string) => {
  const substring = str.substring(str.indexOf('{{'), str.indexOf('}}') + 2);
  const newStr = str.replace(substring, '');
  return encode(newStr).length;
};

export default async function finetuneDataSetsApi(req: NextApiRequest, res: NextApiResponse<FinetuneDataSetsResponse>): Promise<void> {
  try {
    if (req.method === 'POST') {
      const data = JSON.parse(req.body);

      const response = await prisma.finetuneDataSet.create({
        data,
      });

      res.statusCode = 200;
      res.json({ newDataSet: response });
    } else if (req.method === 'PUT') {
      const data = JSON.parse(req.body);
      const { id } = data;
      const promptTemplateTokenCount = getTemplateTokenCount(data.promptTemplate);
      const completionTemplateTokenCount = getTemplateTokenCount(data.completionTemplate);

      if (!id) {
        throw new Error('id is required');
      }

      const response = await prisma.finetuneDataSet.update({
        where: {
          id,
        },
        data: {
          promptTemplateTokenCount,
          completionTemplateTokenCount,
          ...data,
        },
      });

      res.statusCode = 200;
      res.json({ updateDataSet: response });
    } else if (req.method === 'DELETE' && req.query.dataSetId) {
      const [_, data] = await prisma.$transaction([
        prisma.finetuneData.deleteMany({ where: { dataSetId: Number(req.query.dataSetId) } }),
        prisma.finetuneDataSet.delete({ where: { id: Number(req.query.dataSetId) } }),
      ]);

      res.statusCode = 200;
      res.json({ deletedDataSet: data });
    } else if (req.method === 'GET' && req.query.dataSetId && req.query.download) {
      const dataSetTemplate = await prisma.finetuneDataSet.findFirst({
        where: {
          id: Number(req.query.dataSetId),
        },
      });

      if (!dataSetTemplate) {
        res.statusCode = 404;
        res.json({ message: 'Data set not found' });
        return;
      }

      const promptTemplate = Handlebars.compile(dataSetTemplate.promptTemplate);
      const completionTemplate = Handlebars.compile(dataSetTemplate.completionTemplate);
      const ftStream = createFinetuneDataStream(Number(req.query.dataSetId), {
        batchSize: 10000,
        templates: {
          prompt: promptTemplate,
          completion: completionTemplate,
        },
      });

      res.setHeader('content-type', 'application/text');
      ftStream.pipe(res.status(200));
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
