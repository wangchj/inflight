import { Response } from "types/response";

/**
 * Prettifies response payload.
 *
 * @param response The response to prettify.
 */
export default function prettify(response: Response) {
  if (!response.data || !response.headers?.['content-type']) {
    return;
  }

  const contentType = response.headers?.['content-type'];

  try {
    switch (contentType) {
      case 'application/json':
        response.prettyData = JSON.stringify(JSON.parse(response.data), null, 4);
        break;
    }
  }
  catch(error) {
    console.log('Unable to prettify response data', error);
  }
}
