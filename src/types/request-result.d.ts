import { RequestOptions } from "https";
import { Response } from "types/response";

export interface RequestResult {
  requestOptions: RequestOptions;
  response: Response;
}
