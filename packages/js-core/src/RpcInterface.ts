import type { MaybeRpcAccount } from './Account';
import type { Cluster } from './Cluster';
import type { Context } from './Context';
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
  // getProgramAccounts(addresses: PublicKey[]): Promise<MaybeRpcAccount[]>;
  // getBalance(): Promise<SolAmount>;
  // getRent(): Promise<...>;
  // getLatestBlockhash(): Promise<...>;
  // accountExists(): Promise<boolean>;
  // airdrop(): Promise<...>;
  call<Result, Params extends any[]>(
    method: string,
    params?: [...Params],
    options?: RpcOptions
  ): Promise<Result>;
  // supports(method: string): boolean;
  sendTransaction(
    serializedTransaction: SerializedTransaction,
    context: Pick<Context, 'programs'>,
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
    throw Error('RpcInterface not implemented.');
  }

  getCluster(): Cluster {
    throw Error('RpcInterface not implemented.');
  }

  getAccount(): Promise<MaybeRpcAccount> {
    throw Error('RpcInterface not implemented.');
  }

  call<Result>(): Promise<Result> {
    throw Error('RpcInterface not implemented.');
  }

  sendTransaction(): Promise<string> {
    throw Error('RpcInterface not implemented.');
  }

  confirmTransaction(): Promise<RpcConfirmResult> {
    throw Error('RpcInterface not implemented.');
  }
}
