import type { MetaplexPlugin } from './MetaplexPlugin';
import type { PublicKey } from './PublicKey';
import { createSignerFromKeypair } from './Signer';

export type Keypair = {
  publicKey: PublicKey;
  secretKey: Uint8Array;
};

export const keypairSigner = (keypair: Keypair): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(keypairSignerForIdentity(keypair));
    metaplex.use(keypairSignerForPayer(keypair));
  },
});

export const keypairSignerForIdentity = (keypair: Keypair): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.identity = createSignerFromKeypair(metaplex, keypair);
  },
});

export const keypairSignerForPayer = (keypair: Keypair): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.payer = createSignerFromKeypair(metaplex, keypair);
  },
});
