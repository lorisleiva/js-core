import type { MaybeRpcAccount } from './Account';
import type { Cluster } from './Cluster';
import { InterfaceImplementationMissingError } from './errors';
import type { GenericAbortSignal } from './GenericAbortSignal';
import type { PublicKey } from './PublicKey';
import type {
  Blockhash,
  SerializedTransaction,
  TransactionError,
  TransactionSignature,
} from './Transaction';

export interface RpcInterface {
  getEndpoint(): string;
  getCluster(): Cluster;
  getAccount(address: PublicKey): Promise<MaybeRpcAccount>;
  // type RpcBaseOptions = { id?, abortSignal?, commitment? };
  // type RpcGetAccountOptions = RpcBaseOptions & { ... };

  // getAccount(address: PublicKey, options?: RpcGetAccountOptions): Promise<MaybeRpcAccount>;
  // getAccounts(addresses: PublicKey[], options?: RpcGetAccountsOptions): Promise<MaybeRpcAccount[]>;
  // getBalance(address: PublicKey, options?: RpcGetBalanceOptions): Promise<SolAmount>;
  // getRent(bytes: number, options?: RpcGetRentOptions): Promise<SolAmount>; // withHeaderBytes?: boolean
  // getLatestBlockhash(options?: RpcGetLatestBlockhashOptions): Promise<BlockhashWithExpiryBlockHeight>;
  // accountExists(address: PublicKey, options?: RpcAccountExistsOptions): Promise<boolean>;
  // airdrop(address: PublicKey, amount: SolAmount, options?: RpcAirdropOptions): Promise<void>;

  // call<R, P>(method: string, params?: [...P], options?: RpcCallOptions): Promise<R>;
  // sendTransaction(tx: UInt8Array, options?: RpcSendTransactionOptions): Promise<UInt8Array>;
  // confirmTransaction(tx: Transaction, signature: UInt8Array, options?: RpcConfirmTransactionOptions): Promise<RpcConfirmTransactionResult>;

  // confirmTransaction(signature: UInt8Array, strategy: RpcConfirmTransactionStrategy, options?: RpcConfirmTransactionOptions): Promise<RpcConfirmTransactionResult>;
  // type RpcConfirmTransactionStrategy =
  //   | { strategy: 'blockhash'; blockhash: Blockhash; lastValidBlockHeight: number; }
  //   | { strategy: 'durableNonce'; minContextSlot: number; nonceAccountPubkey: PublicKey; nonceValue: string; }

  call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options?: RpcOptions
  ): Promise<Result>;
  sendTransaction(
    serializedTransaction: SerializedTransaction,
    options?: RpcSendOptions
  ): Promise<TransactionSignature>;
  confirmTransaction(
    signature: TransactionSignature,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment
  ): Promise<RpcConfirmResult>;
}

export type Commitment = 'processed' | 'confirmed' | 'finalized';
export type BlockhashWithExpiryBlockHeight = {
  blockhash: Blockhash;
  lastValidBlockHeight: number;
};

export type RpcResultWithContext<Value> = {
  context: { slot: number };
  value: Value;
};

export type RpcOptions = {
  id?: string;
  signal?: GenericAbortSignal;
};

export type RpcConfirmResult = RpcResultWithContext<{
  err: TransactionError | null;
}>;

export type RpcSendOptions = {
  /** disable transaction verification step */
  skipPreflight?: boolean;
  /** preflight commitment level */
  preflightCommitment?: Commitment;
  /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
  maxRetries?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

export class NullRpc implements RpcInterface {
  getEndpoint(): string {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getCluster(): Cluster {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getAccount(): Promise<MaybeRpcAccount> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  call<Result>(): Promise<Result> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  sendTransaction(): Promise<TransactionSignature> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  confirmTransaction(): Promise<RpcConfirmResult> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }
}
