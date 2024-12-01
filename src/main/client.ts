/**
 * This module sends and tracks a Node HTTP/HTTPS request.
 */

import https, { RequestOptions } from "https";
import { TLSSocket } from "tls";
import { Request } from "types/request";
import { Response } from "types/response";

export async function sendRequest(requestOptions: RequestOptions, request: Request): Promise<Response> {
  return new Promise((resolve, reject) => {
    const clientRequest = https.request(requestOptions, res => {
      const socket = res.socket as TLSSocket;
      const peerCertificate = socket.getPeerCertificate()

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
          peerCertificate: {
            ...peerCertificate,
            pubkey: peerCertificate.pubkey?.toString('hex'),
            raw: peerCertificate.raw?.toString('hex'),
          },
        });
      });

      res.on('error', error => {
        reject(error);
      })
    });

    clientRequest.on('error', error => {
      reject(error);
    });

    if (request.body) {
      clientRequest.write(request.body);
    }

    clientRequest.end();
  });
}
