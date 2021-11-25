import { NextApiRequest, NextApiResponse } from 'next';
import { FinetuneDataSetsResponse } from './finetune-data-sets';

interface IFinetuneJobsResponse {
  object: 'list';
  data: {
    id: string;
    object: 'fine-tune' | string;
    fine_tuned_model: string;
    model: string;
    organization_id: string;
    status: string;
    validation_files: any[];
    created_at: Date;
    updated_at: Date;
    hyperparams: {
      batch_size: number;
      learning_rate_multiplier: number;
      n_epochs: number;
      prompt_loss_weight: number;
      use_packing: null | any;
      weight_decay: number;
    }[];
    result_files: {
      bytes: number;
      created_at: Date;
      filename: string;
      id: string;
      object: 'file' | string;
      purpose: string;
      status: string;
    }[];
    training_files: {
      bytes: number;
      created_at: Date;
      filename: string;
      id: string;
      object: 'file';
      purpose: string;
      status: string;
      status_details: null | any;
    }[];
  }[];
}

export default async function modelsApi(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (req.method === 'GET') {
      const finetuneJobsResponse: IFinetuneJobsResponse = await fetch(`${process.env.BASE_URL as string}/finetune_jobs/list`, {
        method: 'GET',
        headers: { Authorization: `jwt ${process.env.JWT_TOKEN as string}`, 'Content-Type': 'application/json' },
      }).then((response) => response.json());

      res.statusCode = 200;
      res.send(finetuneJobsResponse.data);
    }
  } catch (e) {
    console.log(e);
    res.statusCode = 400;
    res.json({ message: (e as Error).message });
  }
}
