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
} from '@lorisleiva/js-core';
import {
  AccountInfo as Web3JSAccountInfo,
  Connection as Web3JsConnection,
  ConnectionConfig as Web3JsConnectionConfig,
  PublicKey as Web3JsPublicKey,
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
      address as Web3JsPublicKey
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
    serializedTransaction: Uint8Array,
    options?: RpcSendOptions
  ): Promise<string> {
    try {
      return await this.connection.sendRawTransaction(
        serializedTransaction,
        options
      );
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
    signature: string,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment
  ): Promise<RpcConfirmResult> {
    return this.connection.confirmTransaction(
      {
        signature,
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
          exists: true,
          address,
          lamports: lamports(account.lamports),
        }
      : { exists: false, address };
  }
}
