import { PeerCertificate } from "tls";

export interface Response {
  httpVersion: string;
  statusCode?: number;
  statusMessage?: string;
  headers: any;
  rawHeaders: string[];
  data?: string;
  prettyData?: string;
  peerCertificate: Omit<PeerCertificate, 'pubkey', 'raw'> & {pubkey?: string, raw: string};
}
