import { Keypair } from '@lorisleiva/js-core';
import { Keypair as Web3JsKeypair } from '@solana/web3.js';
import { fromWeb3JsPublicKey } from './PublicKey';

export function fromWeb3JsKeypair(keypair: Web3JsKeypair): Keypair {
  return {
    publicKey: fromWeb3JsPublicKey(keypair.publicKey),
    secretKey: keypair.secretKey,
  };
}

export function toWeb3JsKeypair(keypair: Keypair): Web3JsKeypair {
  return new Web3JsKeypair({
    publicKey: keypair.publicKey.bytes,
    secretKey: keypair.secretKey,
  });
}
