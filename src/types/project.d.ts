import { Request } from 'types/request';
import { Folder } from 'types/folder';
import { Environment } from 'types/environment';
import { EnvironmentGroup } from 'types/environment-group';

export interface Project {
  schemaVersion: '1.0';
  name: string;
  folders?: Record<string, Folder>;
  requests?: Record<string, Request>;
  tree?: string;
  envs?: Record<string, Environment>;
  envGroups?: Record<string, EnvironmentGroup>;
  envRoot?: string;
}
