import { OpenedResource } from "./opened-resource";

export interface Workspace {
  schemaVersion: '1.0';
  projectPath?: string;
  openedResources?: OpenedResource[];
  selectedResourceIndex?: number;

  /** Tree expanded state */
  treeExpandedState?: Record<string, boolean>;

  /** Maps env group id to its selected env id */
  selectedEnvs?: Record<string, string>;
}
