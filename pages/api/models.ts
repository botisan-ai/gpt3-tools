import { NextApiRequest, NextApiResponse } from 'next';
import { FinetuneDataSetsResponse } from './finetune-data-sets';

interface IOpenApiModelsResponse {
  object: 'list';
  data: {
    id: string;
    object: 'model' | string;
    created: Date;
    owned_by: string;
    parent: string;
    permission: {
      allow_create_engine: boolean;
      allow_fine_tuning: boolean;
      allow_logprobs: boolean;
      allow_sampling: boolean;
      allow_search_indices: boolean;
      allow_view: boolean;
      created: Date;
      id: string;
      object: 'snapshot_permission' | string;
    }[];
    root: string;
  }[];
}

export default async function modelsApi(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (req.method === 'GET') {
      const openApiModelsResponse: IOpenApiModelsResponse = await fetch(`${process.env.BASE_URL as string}/models/list`, {
        method: 'GET',
        headers: { Authorization: `jwt ${process.env.JWT_TOKEN as string}`, 'Content-Type': 'application/json' },
      }).then((response) => response.json());
      res.statusCode = 200;
      res.send(openApiModelsResponse.data);
    }
  } catch (e) {
    console.log(e);
    res.statusCode = 400;
    res.json({ message: (e as Error).message });
  }
}
