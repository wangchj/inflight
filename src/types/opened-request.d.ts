import { Request } from "types/request";

export interface OpenedRequest {
  /**
   * The id of the folder that contains this request within the project.
   */
  folderId?: string;

  /**
   * The request config.
   */
  request: Request;
}
