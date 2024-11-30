import { fromIni } from "@aws-sdk/credential-provider-ini";
import { AwsSigv4Auth } from "types/auth";
import { Request } from "types/request";
import { SignatureV4 } from '@smithy/signature-v4';
import { Hash } from '@smithy/hash-node';
import { RequestOptions } from "https";

/**
 * Make RequestOptions object for an AWS request.
 *
 * @param request The request params.
 * @returns NodeJS RequestOptions object.
 */
export default async function makeAwsRequest(request: Request): Promise<RequestOptions> {
  // TODO: validate request params.
  // The request.auth.type must be 'aws_sigv4'
  // The required params should be specified: region, service, keys.

  const auth = request.auth as AwsSigv4Auth;
  const url = new URL(request.url);
  const credentials = fromIni({profile: auth.profile});

  const signingParams = {
    method: request.method as string,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : undefined,
    path: url.pathname,
    query: (url.searchParams && url.searchParams.size > 0) ?
      Object.fromEntries(url.searchParams.entries()) : undefined,
    fragment: url.hash ? url.hash : undefined,
    headers: {
      'Host': url.hostname,
      // Date format: YYYYMMDD'T'HHMMSS'Z'
      'x-amz-date': new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    },
    username: url.username ? url.username : undefined,
    password: url.password ? url.password : undefined,
    body: request.body ? request.body : undefined
  };

  const signer = new SignatureV4({
    credentials,
    region: auth.region,
    service: auth.service,
    sha256: Hash.bind(null, 'sha256')
  });

  const signature = await signer.sign(signingParams);

  return {
    ...signingParams,
    headers: {
      ...signingParams.headers,
      ...signature.headers
    }
  }
}
