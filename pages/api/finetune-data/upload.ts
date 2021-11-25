import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';

import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import csv from 'papaparse';

import { encode } from 'gpt-3-encoder';
import { FinetuneDataResponse } from './index';

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const apiRoute = nextConnect({
  onError(error, req: any, res: any) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req, res) => {
  const { dataSetId } = req.query;

  const parseStream = csv.parse(csv.NODE_STREAM_INPUT, {
    delimiter: ',',
    header: true,
  });

  await new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    parseStream.on('data', async (chunk) => {
      const promptTokenCount = encode(chunk.prompt).length;
      const completionTokenCount = encode(chunk.completion).length;

      const response2 = await prisma.finetuneData.create({
        data: {
          dataSetId: Number(dataSetId),
          promptTokenCount,
          completionTokenCount,
          ...chunk,
        },
      });
    });
    parseStream.on('finish', () => {
      resolve();
    });
    parseStream.on('error', (err) => {
      console.log(err);
      parseStream.end();
      reject();
    });
    fs.createReadStream(req.file.path).pipe(parseStream);
  });

  console.log('done');
  await prisma.$disconnect();
  res.status(200).json({ data: 'success' });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
