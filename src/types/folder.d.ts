import { Request } from 'types/request';

export interface Folder {
  name: string;
  folders?: Folder[];
  requests?: string[];
}
