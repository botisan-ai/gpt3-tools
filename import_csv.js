// read all-canto-corpus.csv using papaparse as a list of JSON objects
const csv = require('papaparse');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  const results = csv.parse(fs.readFileSync('all-canto-corpus.csv').toString(), {
    delimiter: ',',
    header: true,
  });

  const { data } = results;

  for (const row of data) {
    const response = await prisma.finetuneData.create({
      data: {
        dataSetId: 1,
        prompt: row.cantonese,
        completion: row.mandarin,
      },
    });
    console.log(response)
  }

  console.log('done');
  await prisma.$disconnect();
}

main();
