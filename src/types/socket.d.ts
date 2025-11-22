import { CipherNameAndProtocol, PeerCertificate } from "tls";

export interface Socket {
  readonly localAddress?: string;
  readonly localFamily?: string;
  readonly localPort?: number;

  readonly peerCertificate?: Omit<PeerCertificate, 'pubkey', 'raw'> & {pubkey?: string, raw: string};

  readonly remoteAddress?: string;
  readonly remoteFamily?: string;
  readonly remotePort?: number;

  readonly cipher?: CipherNameAndProtocol;
}
