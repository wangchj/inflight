import { Auth } from 'types/auth';

export interface Request {
  name?: string;
  method: 'GET' | 'POST';
  url: string;
  auth?: Auth;
  headers?: string[];
  body?: string;
}
