/**
 * This module sends and tracks a Node HTTP/HTTPS request.
 */

import https, { RequestOptions } from "https";
import { Response } from "types/response";

export async function sendRequest(requestOptions: RequestOptions): Promise<Response> {
  return new Promise((resolve, reject) => {
    const clientRequest = https.request(requestOptions, res => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          httpVersion: res.httpVersion,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: {...res.headers},
          rawHeaders: res.rawHeaders,
          data: data,
        });
      });

      res.on('error', error => {
        reject(error);
      })
    });

    clientRequest.on('error', error => {
      reject(error);
    });

    clientRequest.end();
  });
}
