import { Item } from 'types/item';

export interface Request extends Item {
  method: 'GET' | 'POST';
  url: string;
  auth?: any; // TODO
  headers?: string[];
  body?: string;
}
