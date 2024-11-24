import { Request } from "types/request";

export interface OpenedRequest {
  /**
   * The path of the request within the project tree.
   */
  path?: string;

  /**
   * The request config.
   */
  request: Request;

  /**
   * Determines if the opened request has unsaved changes.
   */
  dirty?: boolean;
}
