import {
  BlockhashWithExpiryBlockHeight,
  Cluster,
  Commitment,
  Context,
  ErrorWithLogs,
  isZeroAmount,
  lamports,
  MaybeRpcAccount,
  ProgramError,
  PublicKey,
  resolveClusterFromEndpoint,
  RpcAccount,
  RpcBaseOptions,
  RpcCallOptions,
  RpcConfirmTransactionOptions,
  RpcConfirmTransactionResult,
  RpcDataFilter,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  RpcGetProgramAccountsOptions,
  RpcGetRentOptions,
  RpcInterface,
  RpcSendTransactionOptions,
  SerializedTransaction,
  SolAmount,
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
  GetProgramAccountsFilter as Web3JsGetProgramAccountsFilter,
  TransactionConfirmationStrategy as Web3JsTransactionConfirmationStrategy,
} from '@solana/web3.js';

export const ACCOUNT_HEADER_SIZE = 128n;

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

  async getAccount(
    address: PublicKey,
    options: RpcGetAccountOptions = {}
  ): Promise<MaybeRpcAccount> {
    const account = await this.connection.getAccountInfo(
      toWeb3JsPublicKey(address),
      options
    );
    return this.parseMaybeAccount(account, address);
  }

  async getAccounts(
    addresses: PublicKey[],
    options: RpcGetAccountsOptions = {}
  ): Promise<MaybeRpcAccount[]> {
    const accounts = await this.connection.getMultipleAccountsInfo(
      addresses.map(toWeb3JsPublicKey),
      options
    );
    return accounts.map((account, index) =>
      this.parseMaybeAccount(account, addresses[index])
    );
  }

  async getProgramAccounts(
    programId: PublicKey,
    options: RpcGetProgramAccountsOptions = {}
  ): Promise<RpcAccount[]> {
    const accounts = await this.connection.getProgramAccounts(
      toWeb3JsPublicKey(programId),
      {
        ...options,
        filters: options.filters?.map((filter) => this.parseDataFilter(filter)),
      }
    );
    return accounts.map(({ pubkey, account }) =>
      this.parseAccount(account, fromWeb3JsPublicKey(pubkey))
    );
  }

  async getBalance(
    address: PublicKey,
    options: RpcBaseOptions = {}
  ): Promise<SolAmount> {
    const balanceInLamports = await this.connection.getBalance(
      toWeb3JsPublicKey(address),
      options
    );
    return lamports(balanceInLamports);
  }

  async getRent(
    bytes: number,
    options: RpcGetRentOptions = {}
  ): Promise<SolAmount> {
    const rentFor = (bytes: number) =>
      this.connection.getMinimumBalanceForRentExemption(
        bytes,
        options.commitment
      );
    if (options.withHeaderBytes ?? true) {
      return lamports(await rentFor(bytes));
    }
    const headerRent = await rentFor(0);
    const rentPerByte = ACCOUNT_HEADER_SIZE / BigInt(headerRent);
    return lamports(rentPerByte * BigInt(bytes));
  }

  async getLatestBlockhash(
    options: RpcBaseOptions = {}
  ): Promise<BlockhashWithExpiryBlockHeight> {
    return this.connection.getLatestBlockhash(options);
  }

  async accountExists(
    address: PublicKey,
    options: RpcBaseOptions = {}
  ): Promise<boolean> {
    return !isZeroAmount(await this.getBalance(address, options));
  }

  async airdrop(
    address: PublicKey,
    amount: SolAmount,
    options: RpcBaseOptions = {}
  ): Promise<void> {
    const signature = await this.connection.requestAirdrop(
      toWeb3JsPublicKey(address),
      Number(amount.basisPoints)
    );
    await this.confirmTransaction(fromBase58(signature), options);
  }

  async call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options: RpcCallOptions = {}
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
    options: RpcSendTransactionOptions = {}
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
    options: RpcConfirmTransactionOptions
  ): Promise<RpcConfirmTransactionResult> {
    return this.connection.confirmTransaction(
      this.parseConfirmStrategy(signature, options),
      options.commitment
    );
  }

  protected parseAccount(
    account: Web3JSAccountInfo<Uint8Array>,
    address: PublicKey
  ): RpcAccount {
    return {
      ...account,
      owner: fromWeb3JsPublicKey(account.owner),
      address,
      lamports: lamports(account.lamports),
    };
  }

  protected parseMaybeAccount(
    account: Web3JSAccountInfo<Uint8Array> | null,
    address: PublicKey
  ): MaybeRpcAccount {
    return account
      ? { ...this.parseAccount(account, address), exists: true }
      : { exists: false, address };
  }

  protected parseDataFilter(
    filter: RpcDataFilter
  ): Web3JsGetProgramAccountsFilter {
    if (!('memcmp' in filter)) return filter;
    const { bytes, ...rest } = filter.memcmp;
    return { memcmp: { ...rest, bytes: toBase58(bytes) } };
  }

  protected parseConfirmStrategy(
    signature: TransactionSignature,
    options: RpcConfirmTransactionOptions
  ): Web3JsTransactionConfirmationStrategy {
    if (options.strategy.type === 'blockhash') {
      return {
        ...options.strategy,
        signature: toBase58(signature),
      };
    }

    return {
      ...options.strategy,
      signature: toBase58(signature),
      nonceAccountPubkey: toWeb3JsPublicKey(
        options.strategy.nonceAccountPubkey
      ),
    };
  }
}
