import { MetaplexPlugin } from '@lorisleiva/js-core';
import { Web3JsRpc } from './Web3JsRpc';

export const web3JsRpc = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.rpc = new Web3JsRpc();
  },
});
