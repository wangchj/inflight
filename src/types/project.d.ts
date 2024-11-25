import { Request } from 'types/request';
import { Folder } from 'types/folder';

export interface Project {
  name: string;
  requests: Record<string, Request>;
  tree: Folder;
}
