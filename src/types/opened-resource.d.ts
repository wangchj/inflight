import { OpenedResourceProps } from "types/opened-resource-props";
import { OpenedResourceType } from "types/opened-resource-type";

export interface OpenedResource {
  /**
   * The id of the opened resource within the project.
   */
  id: string;

  /**
   * The type of the opened resource.
   */
  type: OpenedResourceType;

  /**
   * The opened resource properties.
   */
  props?: OpenedResourceProps;

  /**
   * Determines if the opened request has unsaved changes.
   */
  dirty?: boolean;
}
