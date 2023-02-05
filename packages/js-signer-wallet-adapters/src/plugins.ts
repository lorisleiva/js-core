import type { MetaplexPlugin } from '@lorisleiva/js-core';
import {
  createSignerFromWalletAdapter,
  WalletAdapter,
} from './createSignerFromWalletAdapter';

export const identityWalletAdapter = (
  walletAdapter: WalletAdapter,
  setPayer = true
): MetaplexPlugin => ({
  install(metaplex) {
    const signer = createSignerFromWalletAdapter(walletAdapter);
    metaplex.identity = signer;
    if (setPayer) metaplex.payer = signer;
  },
});

export const payerWalletAdapter = (
  walletAdapter: WalletAdapter
): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.payer = createSignerFromWalletAdapter(walletAdapter);
  },
});
