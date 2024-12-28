import { Request } from 'types/request';
import { Folder } from 'types/folder';

export interface Project {
  name: string;
  folders?: Record<string, Folder>;
  requests?: Record<string, Request>;
  tree?: string;
}
