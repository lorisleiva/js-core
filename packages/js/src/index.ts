import {
  Metaplex,
  createMetaplex as baseCreateMetaplex,
} from '@lorisleiva/js-core';
import { Web3JsRpcOptions } from '@lorisleiva/js-rpc-web3js';
import { defaultPlugins } from './plugin';

export * from './plugin';

export const createMetaplex = (
  endpoint: string,
  rpcOptions?: Web3JsRpcOptions
): Metaplex => baseCreateMetaplex().use(defaultPlugins(endpoint, rpcOptions));
