import { Request } from "types/request";
import { RequestOptions } from "https";

/**
 * Make https/http module RequestOptions object.
 *
 * @param request The request params.
 * @returns NodeJS RequestOptions object.
 */
export default function makeRequestOptions(request: Request): RequestOptions {
  const url = new URL(request.url);

  return {
    method: request.method as string,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : undefined,
    path: `${url.pathname}${url.search ?? ''}`,
  };
}
