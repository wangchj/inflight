import { Ref } from "types/ref";
import { OpenedRequest } from "./opened-request";

export interface Workspace {
  projectRef?: Ref;
  openedRequests?: OpenedRequest[];
  selectedRequestIndex?: number;

  /** Tree expanded state */
  treeExpandedState?: Record<string, boolean>;
}
