import { PeerCertificate } from "tls";
import { Socket } from "./socket";

export interface Response {
  httpVersion: string;
  statusCode?: number;
  statusMessage?: string;
  headers: any;
  rawHeaders: string[];
  data?: string;
  socket: Socket;
}
