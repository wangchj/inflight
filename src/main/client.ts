/**
 * This module sends and tracks a Node HTTP/HTTPS request.
 */

import http, { IncomingMessage } from "http";
import https, { RequestOptions } from "https";
import { TLSSocket } from "tls";
import { Request } from "types/request";
import { Response } from "types/response";

let data = '';

function onRequestData(chunk: any) {
  data += chunk;
}

function onRequestEnd(resolve: (value: Response) => void, res: IncomingMessage, socket: TLSSocket) {
  const peerCertificate = socket.getPeerCertificate ? socket.getPeerCertificate() : undefined;

  resolve({
    httpVersion: res.httpVersion,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    headers: {...res.headers},
    rawHeaders: res.rawHeaders,
    data: data,
    socket: {
      localAddress: socket.localAddress,
      localFamily: socket.localFamily,
      localPort: socket.localPort,
      remoteAddress: socket.remoteAddress,
      remoteFamily: socket.remoteFamily,
      remotePort: socket.remotePort,
      peerCertificate: peerCertificate ? {
        ...peerCertificate,
        pubkey: peerCertificate.pubkey?.toString('hex'),
        raw: peerCertificate.raw?.toString('hex'),
      } : undefined,
      cipher: socket.getCipher ? socket.getCipher() : undefined,
    },
  });
}

function onRequestError(reject: (error: Error) => void, error: Error) {
  reject(error);
}

export async function sendRequest(requestOptions: RequestOptions, request: Request): Promise<Response> {
  data = '';

  return new Promise((resolve, reject) => {

    /**
     * Request callback handler.
     *
     * @param res Request response.
     */
    function callback(res: IncomingMessage) {
      const socket = res.socket as TLSSocket;

      res.on('data', onRequestData);
      res.on('end', () => onRequestEnd(resolve, res, socket));
      res.on('error', error => onRequestError(reject, error));
    }

    // Makes the request.
    const clientRequest = requestOptions.protocol === 'http:' ?
      http.request(requestOptions, callback) :
      https.request(requestOptions, callback);

    clientRequest.on('error', error => {
      reject(error);
    });

    if (request.body) {
      clientRequest.write(request.body);
    }

    clientRequest.end();
  });
}
