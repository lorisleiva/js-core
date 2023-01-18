import { base58 } from './utils';

export type PublicKeyInput = PublicKeyBase58 | PublicKeyBytes | PublicKey;
export type PublicKeyBase58 = string;
export type PublicKeyBytes = Uint8Array;

export type PublicKey = {
  readonly bytes: PublicKeyBytes;
};

export type Pda = PublicKey & {
  readonly bump: number;
};

export const publicKey = (input: PublicKeyInput): PublicKey => {
  if (isPublicKey(input)) return { bytes: new Uint8Array(input.bytes) };
  if (typeof input === 'string') return { bytes: base58.serialize(input) };
  return { bytes: input };
};

export const defaultPublicKey = (): PublicKey =>
  publicKey('11111111111111111111111111111111');

export const isPublicKey = (value: any): value is PublicKey =>
  typeof value === 'object' &&
  typeof value.bytes === 'object' &&
  typeof value.bytes.BYTES_PER_ELEMENT === 'number' &&
  typeof value.bytes.length === 'number' &&
  value.bytes.BYTES_PER_ELEMENT === 1 &&
  value.bytes.length === 32;

export const isPda = (value: any): value is Pda =>
  typeof value === 'object' &&
  typeof value.bump === 'number' &&
  isPublicKey(value);

export const samePublicKey = (left: PublicKey, right: PublicKey): boolean =>
  left.bytes.toString() === right.bytes.toString();

export const formatPublicKey = (publicKey: PublicKey): string =>
  base58.deserialize(publicKey.bytes)[0];
