import { Request } from "types/request";

export interface OpenedRequest {
  /**
   * The id of the request within the project.
   */
  id: string;

  /**
   * The id of the folder that contains this request within the project.
   */
  folderId?: string;

  /**
   * The request config.
   */
  request: Request;

  /**
   * Determines if the opened request has unsaved changes.
   */
  dirty?: boolean;
}
