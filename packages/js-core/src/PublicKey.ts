export type PublicKeyInput = PublicKeyBase58 | PublicKeyBytes | PublicKey;
export type PublicKeyBase58 = string;
export type PublicKeyBytes = Uint8Array;

export type PublicKey = {
  readonly bytes: PublicKeyBytes;
};

export type Pda = PublicKey & {
  readonly bump: number;
};
