import { isPublicKey, PublicKey, PublicKeyInput } from '@lorisleiva/js-core';
import {
  PublicKey as Web3JsPublicKey,
  PublicKeyInitData as Web3JsPublicKeyInput,
} from '@solana/web3.js';

export function fromWeb3JsPublicKey(publicKey: Web3JsPublicKey): PublicKey {
  return { bytes: publicKey.toBytes() };
}

export function toWeb3JsPublicKey(publicKey: PublicKey): Web3JsPublicKey {
  return new Web3JsPublicKey(publicKey.bytes);
}

export function toWeb3JsPublicKeyInput(
  input: PublicKeyInput
): Web3JsPublicKeyInput {
  return isPublicKey(input) ? toWeb3JsPublicKey(input) : input;
}
