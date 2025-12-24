import makeRequestOptions from 'main/make-request-options';
import { Request } from "types/request";
import { RequestResult } from "types/request-result";
import { signRequestSigv4Web } from './sign-request-sigv4-web';
import { getAwsCredentials } from 'main/get-aws-credentials';
import { AwsSigv4Auth } from 'types/auth';

/**
 * Sends an HTTP request using Fetch API. This function is only used in the web build. The corresponding node version
 * can be found in `index.ts` `sendRequest()`.
 *
 * @returns A promise that resolves to a RequestResult object.
 * @throws An error object if request fails.
 */
export async function sendRequestWeb(request: Request): Promise<RequestResult> {
  const requestInit = makeRequestInit(request);

  await signRequest(requestInit, request);

  try {
    let response = await fetch(request.url, requestInit);
    return makeRequestResult(request, requestInit, response);
  }
  catch (error) {
    console.log(error);
    error.message = 'Make sure you are online and the URL supports CORS.';
    throw error;
  }
}

/**
 * Converts a request settings object to Fetch RequestInit object.
 *
 * @param request The request settings object.
 * @returns The result RequestInit object.
 */
function makeRequestInit(request: Request): RequestInit {
  const headers: Record<string, string> = Array.isArray(request.headers) ? Object.fromEntries(
    request.headers
      .filter(headers => headers.enabled && !!headers.key)
      .map(header => [header.key, header.value])
  ) : {};

  const res: RequestInit = {
    method: request.method,
    headers,
    body: request.body ? request.body : undefined,
  };

  return res;
}

/**
 * Signs the RequestInit object if required. This function modifies the RequestInit object with signature.
 *
 * @param requestInit The RequestInit object to sign.
 * @param request The request object.
 */
async function signRequest(requestInit: RequestInit, request: Request) {
  if (request.auth?.type === 'aws_sigv4') {
    const credentials = getAwsCredentials(request.auth as AwsSigv4Auth);
    await signRequestSigv4Web(requestInit, request, credentials);
  }
}

/**
 * Makes request result object.
 *
 * @param request The request model object.
 * @param requestInit The Fetch request init object.
 * @param response The Fetch response object.
 * @returns The request result object.
 */
async function makeRequestResult(
  request: Request,
  requestInit: RequestInit,
  response: Response
): Promise<RequestResult> {
  return {
    requestOptions: {
      ...makeRequestOptions(request),
      headers: requestInit.headers as Record<string, string>,
    },
    response: {
      statusCode: response.status,
      statusMessage: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      rawHeaders: [...response.headers.entries()].reduce((a, e) => {
        a.push(e[0]);
        a.push(e[1])
        return a;
      }, []),
      data: await response.text(),
    }
  }
}
