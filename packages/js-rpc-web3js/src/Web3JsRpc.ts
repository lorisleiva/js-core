import {
  base58,
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
  RpcAccountExistsOptions,
  RpcAirdropOptions,
  RpcCallOptions,
  RpcConfirmTransactionOptions,
  RpcConfirmTransactionResult,
  RpcDataFilter,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  RpcGetBalanceOptions,
  RpcGetLatestBlockhashOptions,
  RpcGetProgramAccountsOptions,
  RpcGetRentOptions,
  RpcInterface,
  RpcSendTransactionOptions,
  SolAmount,
  Transaction,
  TransactionSignature,
} from '@lorisleiva/js-core';
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from '@lorisleiva/js-web3js-adapters';
import {
  AccountInfo as Web3JSAccountInfo,
  Connection as Web3JsConnection,
  ConnectionConfig as Web3JsConnectionConfig,
  GetProgramAccountsFilter as Web3JsGetProgramAccountsFilter,
  TransactionConfirmationStrategy as Web3JsTransactionConfirmationStrategy,
} from '@solana/web3.js';
import type { JSONRPCCallbackTypePlain } from 'jayson';
import type RpcClient from 'jayson/lib/client/browser';

export const ACCOUNT_HEADER_SIZE = 128n;

export type Web3JsRpcOptions = Commitment | Web3JsConnectionConfig;

export class Web3JsRpc implements RpcInterface {
  protected readonly context: Pick<Context, 'programs' | 'transactions'>;

  public readonly connection: Web3JsConnection;

  public readonly cluster: Cluster;

  constructor(
    context: Pick<Context, 'programs' | 'transactions'>,
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
    options: RpcGetBalanceOptions = {}
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
    if (options.includesHeaderBytes ?? false) {
      const headerRent = await rentFor(0);
      const rentPerByte = ACCOUNT_HEADER_SIZE / BigInt(headerRent);
      return lamports(rentPerByte * BigInt(bytes));
    }
    return lamports(await rentFor(bytes));
  }

  async getLatestBlockhash(
    options: RpcGetLatestBlockhashOptions = {}
  ): Promise<BlockhashWithExpiryBlockHeight> {
    return this.connection.getLatestBlockhash(options);
  }

  async accountExists(
    address: PublicKey,
    options: RpcAccountExistsOptions = {}
  ): Promise<boolean> {
    return !isZeroAmount(await this.getBalance(address, options));
  }

  async airdrop(
    address: PublicKey,
    amount: SolAmount,
    options: RpcAirdropOptions = {}
  ): Promise<void> {
    const signature = await this.connection.requestAirdrop(
      toWeb3JsPublicKey(address),
      Number(amount.basisPoints)
    );
    if (options.strategy) {
      this.confirmTransaction(
        base58.serialize(signature),
        options as RpcConfirmTransactionOptions
      );
      return;
    }
    this.confirmTransaction(base58.serialize(signature), {
      ...options,
      strategy: { type: 'blockhash', ...(await this.getLatestBlockhash()) },
    });
  }

  async call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options: RpcCallOptions = {}
  ): Promise<Result> {
    const client = (this.connection as any)._rpcClient as RpcClient;
    return new Promise((resolve, reject) => {
      const callback: JSONRPCCallbackTypePlain = (error, result) =>
        error ? reject(error) : resolve(result);
      client.request(method, params, options.id ?? null, callback);
    });
  }

  async sendTransaction(
    transaction: Transaction,
    options: RpcSendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    try {
      const signature = await this.connection.sendRawTransaction(
        this.context.transactions.serialize(transaction),
        options
      );
      return base58.serialize(signature);
    } catch (error: any) {
      let resolvedError: ProgramError | null = null;
      if (error instanceof Error && 'logs' in error) {
        resolvedError = this.context.programs.resolveError(
          error as ErrorWithLogs,
          transaction
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
    return { memcmp: { ...rest, bytes: base58.deserialize(bytes)[0] } };
  }

  protected parseConfirmStrategy(
    signature: TransactionSignature,
    options: RpcConfirmTransactionOptions
  ): Web3JsTransactionConfirmationStrategy {
    if (options.strategy.type === 'blockhash') {
      return {
        ...options.strategy,
        signature: base58.deserialize(signature)[0],
      };
    }
    return {
      ...options.strategy,
      signature: base58.deserialize(signature)[0],
      nonceAccountPubkey: toWeb3JsPublicKey(
        options.strategy.nonceAccountPubkey
      ),
    };
  }
}
