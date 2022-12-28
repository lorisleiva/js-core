/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BlockhashWithExpiryBlockHeight,
  Cluster,
  Commitment,
  Context,
  MaybeRpcAccount,
  PublicKey,
  RpcConfirmResult,
  RpcInterface,
  RpcOptions,
  RpcSendOptions,
  resolveClusterFromEndpoint,
} from '@lorisleiva/js-core';
import {
  ConnectionConfig as Web3JsConnectionConfig,
  Connection as Web3JsConnection,
} from '@solana/web3.js';

export type Web3JsRpcOptions = Commitment | Web3JsConnectionConfig;

export class Web3JsRpc implements RpcInterface {
  readonly connection: Web3JsConnection;

  readonly cluster: Cluster;

  constructor(endpoint: string, rpcOptions?: Web3JsRpcOptions) {
    this.connection = new Web3JsConnection(endpoint, rpcOptions);
    this.cluster = resolveClusterFromEndpoint(endpoint);
  }

  getEndpoint(): string {
    return this.connection.rpcEndpoint;
  }

  getCluster(): Cluster {
    return this.cluster;
  }

  async getAccount(address: PublicKey): Promise<MaybeRpcAccount> {
    throw new Error('Method not implemented.');
  }

  async call<Result, Params extends any[]>(
    method: string,
    params?: [...Params] | undefined,
    options?: RpcOptions | undefined
  ): Promise<Result> {
    throw new Error('Method not implemented.');
  }

  async sendTransaction(
    serializedTransaction: Uint8Array,
    context: Pick<Context, 'programs'>,
    options?: RpcSendOptions | undefined
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async confirmTransaction(
    signature: string,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment | undefined
  ): Promise<RpcConfirmResult> {
    throw new Error('Method not implemented.');
  }
}
