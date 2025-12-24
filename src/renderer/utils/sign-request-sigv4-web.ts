import { AwsCredentialIdentity, HttpRequest, Provider } from "@aws-sdk/types";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { Request } from "types/request";
import { AwsSigv4Auth } from "types/auth";

/**
 * Signs a request using AWS Signature V4. This function modifies the request init object that's
 * passed in.
 *
 * This function is only used for the web build. The corresponding node version is found in
 * `main/sign-request-sigv4.ts`.
 *
 * @param requestInit The Fetch request init object to sign.
 * @param request The request settings object.
 * @param credentials The AWS credentials object.
 */
export async function signRequestSigv4Web(
  requestInit: RequestInit,
  request: Request,
  credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>
) {
  const auth = request.auth as AwsSigv4Auth;

  if (!auth.region) {
    throw new Error("Region is required.");
  }

  if (!auth.service) {
    throw new Error("Service is required.");
  }

  if (!credentials) {
    throw new Error("AWS credentials is required.");
  }

  const url = new URL(request.url);

  const httpRequest: HttpRequest = {
    method: requestInit.method,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : undefined,
    path: url.pathname,
    query: (url.searchParams && url.searchParams.size > 0) ?
      Object.fromEntries(url.searchParams.entries()) : undefined,
    fragment: url.hash ? url.hash : undefined,
    headers: {
      'host': url.host,
      // Date format: YYYYMMDD'T'HHMMSS'Z'
      'x-amz-date': new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      ...requestInit.headers as Record<string, string>,
    },
    body: requestInit.body? requestInit.body : undefined,
  };

  const signer = new SignatureV4({
    credentials,
    region: auth.region,
    service: auth.service,
    sha256: Sha256,
  });

  const signature = await signer.sign(httpRequest);

  requestInit.headers = {
    ...requestInit.headers,
    ...signature.headers,
  };
}
