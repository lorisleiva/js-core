import {
  BlockhashWithExpiryBlockHeight,
  Cluster,
  Commitment,
  Context,
  ErrorWithLogs,
  lamports,
  MaybeRpcAccount,
  ProgramError,
  PublicKey,
  resolveClusterFromEndpoint,
  RpcConfirmResult,
  RpcInterface,
  RpcOptions,
  RpcSendOptions,
  SerializedTransaction,
  TransactionSignature,
} from '@lorisleiva/js-core';
import {
  fromBase58,
  fromWeb3JsPublicKey,
  toBase58,
  toWeb3JsPublicKey,
} from '@lorisleiva/js-web3js-adapters';
import {
  AccountInfo as Web3JSAccountInfo,
  Connection as Web3JsConnection,
  ConnectionConfig as Web3JsConnectionConfig,
} from '@solana/web3.js';

export type Web3JsRpcOptions = Commitment | Web3JsConnectionConfig;

export class Web3JsRpc implements RpcInterface {
  protected readonly context: Pick<Context, 'programs'>;

  public readonly connection: Web3JsConnection;

  public readonly cluster: Cluster;

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
      toWeb3JsPublicKey(address)
    );

    return this.parseMaybeAccount(account, address);
  }

  async call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options: RpcOptions = {}
  ): Promise<Result> {
    const client = (this.connection as any)._rpcClient;
    return new Promise((resolve, reject) => {
      const callback = (error: any, result: any) =>
        error ? reject(error) : resolve(result);
      client.request(method, params, options.id ?? null, callback);
    });
  }

  async sendTransaction(
    serializedTransaction: SerializedTransaction,
    options?: RpcSendOptions
  ): Promise<TransactionSignature> {
    try {
      const signature = await this.connection.sendRawTransaction(
        serializedTransaction,
        options
      );
      return fromBase58(signature);
    } catch (error: any) {
      let resolvedError: ProgramError | null = null;
      if (error instanceof Error && 'logs' in error) {
        resolvedError = this.context.programs.resolveError(
          error as ErrorWithLogs
        );
      }
      throw resolvedError || error;
    }
  }

  async confirmTransaction(
    signature: TransactionSignature,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment
  ): Promise<RpcConfirmResult> {
    return this.connection.confirmTransaction(
      {
        signature: toBase58(signature),
        ...blockhashWithExpiryBlockHeight,
      },
      commitment
    );
  }

  protected parseMaybeAccount(
    account: Web3JSAccountInfo<Uint8Array> | null,
    address: PublicKey
  ): MaybeRpcAccount {
    return account
      ? {
          ...account,
          owner: fromWeb3JsPublicKey(account.owner),
          exists: true,
          address,
          lamports: lamports(account.lamports),
        }
      : { exists: false, address };
  }
}
