import { generateSigner, MetaplexPlugin } from '@lorisleiva/js-core';
import { web3JsEddsa } from '@lorisleiva/js-eddsa-web3js';
import { fetchHttp } from '@lorisleiva/js-http-fetch';
import { web3JsRpc, Web3JsRpcOptions } from '@lorisleiva/js-rpc-web3js';
import { beetSerializer } from '@lorisleiva/js-serializer-beet';
import { mockStorage } from '@lorisleiva/js-storage-mock';
import { web3JsTransactionFactory } from '@lorisleiva/js-transaction-factory-web3js';

export const testPlugins = (
  endpoint: string = 'http://localhost:8899',
  rpcOptions?: Web3JsRpcOptions
): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(beetSerializer());
    metaplex.use(fetchHttp());
    metaplex.use(web3JsEddsa());
    metaplex.use(web3JsRpc(endpoint, rpcOptions));
    metaplex.use(web3JsTransactionFactory());
    metaplex.use(mockStorage());

    // Use new Keypair as identity and payer.
    const identity = generateSigner(metaplex);
    metaplex.identity = identity;
    metaplex.payer = identity;
  },
});
