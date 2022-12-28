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
  lamports,
} from '@lorisleiva/js-core';
import {
  ConnectionConfig as Web3JsConnectionConfig,
  Connection as Web3JsConnection,
  PublicKey as Web3JsPublicKey,
  AccountInfo as Web3JSAccountInfo,
} from '@solana/web3.js';

export type Web3JsRpcOptions = Commitment | Web3JsConnectionConfig;

export class Web3JsRpc implements RpcInterface {
  readonly context: Pick<Context, 'programs'>;

  readonly connection: Web3JsConnection;

  readonly cluster: Cluster;

  constructor(
    context: Pick<Context, 'programs'>,
    endpoint: string,
    rpcOptions?: Web3JsRpcOptions
  ) {
    this.context = context;
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
    const account = await this.connection.getAccountInfo(
      address as Web3JsPublicKey
    );

    return this.parseMaybeAccount(account, address);
  }

  async call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options?: RpcOptions
  ): Promise<Result> {
    throw new Error('Method not implemented.');
  }

  async sendTransaction(
    serializedTransaction: Uint8Array,
    options?: RpcSendOptions
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async confirmTransaction(
    signature: string,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment
  ): Promise<RpcConfirmResult> {
    throw new Error('Method not implemented.');
  }

  protected parseMaybeAccount(
    account: Web3JSAccountInfo<Uint8Array> | null,
    address: PublicKey
  ): MaybeRpcAccount {
    return account
      ? {
          ...account,
          exists: true,
          address,
          lamports: lamports(account.lamports),
        }
      : { exists: false, address };
  }
}
