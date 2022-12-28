import {
  EddsaInterface,
  Keypair,
  Pda,
  PublicKey,
  PublicKeyInput,
} from '@lorisleiva/js-core';
import {
  Keypair as Web3JsKeypair,
  PublicKey as Web3JsPublicKey,
} from '@solana/web3.js';
import * as ed25519 from '@noble/ed25519';

export class Web3JsEddsa implements EddsaInterface {
  generateKeypair(): Keypair {
    return Web3JsKeypair.generate();
  }

  createKeypairFromSecretKey(secretKey: Uint8Array): Keypair {
    return Web3JsKeypair.fromSecretKey(secretKey);
  }

  createKeypairFromSeed(seed: Uint8Array): Keypair {
    return Web3JsKeypair.fromSeed(seed);
  }

  createPublicKey(input: PublicKeyInput): PublicKey {
    return new Web3JsPublicKey(input);
  }

  createDefaultPublicKey(): PublicKey {
    return Web3JsPublicKey.default;
  }

  isOnCurve(input: PublicKeyInput): boolean {
    return Web3JsPublicKey.isOnCurve(input);
  }

  findPda(programId: PublicKey, seeds: Uint8Array[]): Pda {
    const [key, bump] = Web3JsPublicKey.findProgramAddressSync(
      seeds,
      new Web3JsPublicKey(programId)
    );
    return { ...(key as PublicKey), bump };
  }

  sign(message: Uint8Array, keypair: Keypair): Uint8Array {
    return ed25519.sync.sign(message, keypair.secretKey.slice(0, 32));
  }

  verify(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: PublicKey
  ): boolean {
    return ed25519.sync.verify(signature, message, publicKey.toBytes());
  }
}
