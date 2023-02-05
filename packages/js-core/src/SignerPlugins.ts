import { createSignerFromKeypair, Keypair } from './KeyPair';
import type { MetaplexPlugin } from './MetaplexPlugin';
import type { Signer } from './Signer';

export const identitySigner = (
  signer: Signer,
  setPayer = true
): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.identity = signer;
    if (setPayer) {
      metaplex.payer = signer;
    }
  },
});

export const payerSigner = (signer: Signer): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.payer = signer;
  },
});

export const identityKeypair = (
  keypair: Keypair,
  setPayer = true
): MetaplexPlugin => ({
  install(metaplex) {
    const signer = createSignerFromKeypair(metaplex, keypair);
    metaplex.use(identitySigner(signer, setPayer));
  },
});

export const payerKeypair = (keypair: Keypair): MetaplexPlugin => ({
  install(metaplex) {
    const signer = createSignerFromKeypair(metaplex, keypair);
    metaplex.use(payerSigner(signer));
  },
});
