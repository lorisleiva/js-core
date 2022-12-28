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
  // getAccounts(addresses: PublicKey[]): Promise<MaybeRpcAccount[]>;
  // getProgramAccounts(program: PublicKey, filters: todo[]): Promise<MaybeRpcAccount[]>;
  // getBalance(address: PublicKey): Promise<SolAmount>;
  // getRent(bytes: number, withHeaderBytes?: boolean): Promise<SolAmount>;
  // getLatestBlockhash(): Promise<{...}>;
  // accountExists(address: PublicKey): Promise<boolean>;
  // airdrop(address: PublicKey, amount: SolAmount): Promise<void>;
  call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options?: RpcOptions
  ): Promise<Result>;
  // supports(method: string): boolean;
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

  sendTransaction(): Promise<string> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  confirmTransaction(): Promise<RpcConfirmResult> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }
}
