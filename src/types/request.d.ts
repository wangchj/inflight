import { Auth } from 'types/auth';
import { Header } from 'types/header';

export interface Request {
  name?: string;
  method: 'GET' | 'POST';
  url: string;
  auth?: Auth;
  headers?: Header[];
  body?: string;
  contentType?: string;
}
