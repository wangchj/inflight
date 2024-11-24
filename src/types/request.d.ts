import { Item } from 'types/item';
import { Auth } from 'types/auth';
export interface Request extends Item {
  method: 'GET' | 'POST';
  url: string;
  auth?: Auth;
  headers?: string[];
  body?: string;
}
