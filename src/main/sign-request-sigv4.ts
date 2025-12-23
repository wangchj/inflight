import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { AwsCredentialIdentity, HttpRequest, Provider } from "@aws-sdk/types";
import { SignatureV4 } from '@smithy/signature-v4';
import { Hash } from '@smithy/hash-node';
import { AwsSigv4Auth, AwsSigv4CliProfileAuth, AwsSigv4InlineAuth } from "types/auth";
import { Request } from "types/request";
import { RequestOptions } from "https";


/**
 * Updates specified request options params with AWS Signature V4 signature.
 *
 * @param requestOptions The request options object to update.
 * @param request The request params.
 */
export default async function signRequestSigv4(
  requestOptions: RequestOptions,
  request: Request
): Promise<void> {
  // TODO: validate request params.
  // The request.auth.type must be 'aws_sigv4'
  // The required params should be specified: region, service, keys.

  const auth = request.auth as AwsSigv4Auth;
  const url = new URL(request.url);
  const credentials = getCredentials(auth);

  const signingParams: HttpRequest = {
    method: requestOptions.method,
    protocol: requestOptions.protocol,
    hostname: requestOptions.hostname,
    port: requestOptions.port as number,
    path: url.pathname,
    query: (url.searchParams && url.searchParams.size > 0) ?
      Object.fromEntries(url.searchParams.entries()) : undefined,
    fragment: url.hash ? url.hash : undefined,
    headers: {
      'Host': url.hostname,
      // Date format: YYYYMMDD'T'HHMMSS'Z'
      'x-amz-date': new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    },
    body: request.body ? request.body : undefined
  };

  const signer = new SignatureV4({
    credentials,
    region: auth.region,
    service: auth.service,
    sha256: Hash.bind(null, 'sha256')
  });

  const signature = await signer.sign(signingParams);

  requestOptions.headers = {
    ...signature.headers
  };
}

/**
 * Gets the sigv4 credentials provider object from request auth settings.
 *
 * @param auth The request auth settings object.
 * @returns The credentials provider object.
 */
function getCredentials(auth: AwsSigv4Auth): AwsCredentialIdentity | Provider<AwsCredentialIdentity> | undefined {
  switch (auth.source) {
    case 'inline':
      const inline = auth as AwsSigv4InlineAuth;
      return {
        accessKeyId: inline.accessKey,
        secretAccessKey: inline.secretKey,
        sessionToken: inline.sessionToken,
      };

    default:
      const cli = auth as AwsSigv4CliProfileAuth;
      return fromNodeProviderChain({profile: cli.profile, ignoreCache: true});
  }
}
