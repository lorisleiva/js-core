import bs58 from 'bs58';

export function fromBase58(encoded: string): Uint8Array {
  return bs58.decode(encoded);
}

export function toBase58(bytes: Uint8Array): string {
  return bs58.encode(bytes);
}
