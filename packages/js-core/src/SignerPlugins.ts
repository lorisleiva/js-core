import type { MetaplexPlugin } from './MetaplexPlugin';
import type { Signer } from './Signer';

export const globalSigner = (signer: Signer): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(identitySigner(signer));
    metaplex.use(payerSigner(signer));
  },
});

export const identitySigner = (signer: Signer): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.identity = signer;
  },
});

export const payerSigner = (signer: Signer): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.payer = signer;
  },
});
