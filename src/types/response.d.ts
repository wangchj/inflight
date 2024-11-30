export interface Response {
  httpVersion: string;
  statusCode?: number;
  statusMessage?: string;
  headers: any;
  rawHeaders: string[];
  data?: string;
}
