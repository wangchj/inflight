import { Request } from "types/request";
import { Environment } from "types/environment";
import { OpenedResourceType } from "types/opened-resource-type";

export interface OpenedResource {
  /**
   * The id of the opened resource within the project.
   */
  id: string;

  /**
   * The id of parent of the opened resource within the project. For a request, this is the parent
   * folder id. For an environment, this is the environment group id.
   */
  parentId?: string;

  /**
   * The type of the opened resource.
   */
  type: OpenedResourceType;

  /**
   * The opened resource model object.
   */
  model: Request | Environment;

  /**
   * Determines if the opened request has unsaved changes.
   */
  dirty?: boolean;
}
