import { OpenedResource } from "./opened-resource";

export interface Workspace {
  schemaVersion: '2.0';
  projectPath?: string;
  openedResources?: OpenedResource[];
  selectedResourceIndex?: number;

  /** Tree expanded state */
  treeExpandedState?: Record<string, boolean>;

  /** Maps dimension id to its selected variant id */
  selectedVariants?: Record<string, string>;
}
