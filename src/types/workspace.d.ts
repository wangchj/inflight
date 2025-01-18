import { Ref } from "types/ref";
import { OpenedResource } from "./opened-resource";

export interface Workspace {
  projectRef?: Ref;
  openedResources?: OpenedResource[];
  selectedResourceIndex?: number;

  /** Tree expanded state */
  treeExpandedState?: Record<string, boolean>;
}
