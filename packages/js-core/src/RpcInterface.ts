import type { MaybeRpcAccount, RpcAccount } from './Account';
import { SolAmount } from './Amount';
import type { Cluster } from './Cluster';
import { InterfaceImplementationMissingError } from './errors';
import type { GenericAbortSignal } from './GenericAbortSignal';
import type { PublicKey } from './PublicKey';
import type {
  Blockhash,
  Transaction,
  TransactionError,
  TransactionSignature,
} from './Transaction';

export interface RpcInterface {
  getEndpoint(): string;
  getCluster(): Cluster;
  getAccount(
    address: PublicKey,
    options?: RpcGetAccountOptions
  ): Promise<MaybeRpcAccount>;
  getAccounts(
    addresses: PublicKey[],
    options?: RpcGetAccountsOptions
  ): Promise<MaybeRpcAccount[]>;
  getProgramAccounts(
    programId: PublicKey,
    options?: RpcGetProgramAccountsOptions
  ): Promise<RpcAccount[]>;
  getBalance(
    address: PublicKey,
    options?: RpcGetBalanceOptions
  ): Promise<SolAmount>;
  getRent(bytes: number, options?: RpcGetRentOptions): Promise<SolAmount>;
  getLatestBlockhash(
    options?: RpcGetLatestBlockhashOptions
  ): Promise<BlockhashWithExpiryBlockHeight>;
  accountExists(
    address: PublicKey,
    options?: RpcAccountExistsOptions
  ): Promise<boolean>;
  airdrop(
    address: PublicKey,
    amount: SolAmount,
    options?: RpcAirdropOptions
  ): Promise<void>;
  call<R, P extends any[]>(
    method: string,
    params?: [...P],
    options?: RpcCallOptions
  ): Promise<R>;
  sendTransaction(
    transaction: Transaction,
    options?: RpcSendTransactionOptions
  ): Promise<TransactionSignature>;
  confirmTransaction(
    signature: TransactionSignature,
    options: RpcConfirmTransactionOptions
  ): Promise<RpcConfirmTransactionResult>;
}

export type Commitment = 'processed' | 'confirmed' | 'finalized';
export type BlockhashWithExpiryBlockHeight = {
  blockhash: Blockhash;
  lastValidBlockHeight: number;
};

export type RpcDataSlice = { offset: number; length: number };
export type RpcDataFilter = RpcDataFilterSize | RpcDataFilterMemcmp;
export type RpcDataFilterSize = { dataSize: number };
export type RpcDataFilterMemcmp = {
  memcmp: { offset: number; bytes: Uint8Array };
};

export type RpcResultWithContext<Value> = {
  context: { slot: number };
  value: Value;
};

export type RpcBaseOptions = {
  id?: string;
  signal?: GenericAbortSignal;
  commitment?: Commitment;
  minContextSlot?: number;
};

export type RpcGetAccountOptions = RpcBaseOptions & {
  dataSlice?: RpcDataSlice;
};

export type RpcGetAccountsOptions = RpcBaseOptions & {
  dataSlice?: RpcDataSlice;
};

export type RpcGetProgramAccountsOptions = RpcBaseOptions & {
  dataSlice?: RpcDataSlice;
  filters?: RpcDataFilter[];
};

export type RpcGetBalanceOptions = RpcBaseOptions;

export type RpcGetRentOptions = RpcBaseOptions & {
  /** @defaultValue `false` */
  includesHeaderBytes?: boolean;
};

export type RpcGetLatestBlockhashOptions = RpcBaseOptions;

export type RpcAccountExistsOptions = RpcBaseOptions;

export type RpcAirdropOptions = Partial<RpcConfirmTransactionOptions>;

export type RpcCallOptions = RpcBaseOptions;

export type RpcSendTransactionOptions = RpcBaseOptions & {
  skipPreflight?: boolean;
  preflightCommitment?: Commitment;
  maxRetries?: number;
};

export type RpcConfirmTransactionOptions = RpcBaseOptions & {
  strategy: RpcConfirmTransactionStrategy;
};

export type RpcConfirmTransactionStrategy =
  | {
      type: 'blockhash';
      blockhash: Blockhash;
      lastValidBlockHeight: number;
    }
  | {
      type: 'durableNonce';
      minContextSlot: number;
      nonceAccountPubkey: PublicKey;
      nonceValue: string;
    };

export type RpcConfirmTransactionResult = RpcResultWithContext<{
  err: TransactionError | null;
}>;

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

  getAccounts(): Promise<MaybeRpcAccount[]> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getProgramAccounts(): Promise<RpcAccount[]> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getBalance(): Promise<SolAmount> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getRent(): Promise<SolAmount> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  getLatestBlockhash(): Promise<BlockhashWithExpiryBlockHeight> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  accountExists(): Promise<boolean> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  airdrop(): Promise<void> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  call<Result>(): Promise<Result> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  sendTransaction(): Promise<TransactionSignature> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }

  confirmTransaction(): Promise<RpcConfirmTransactionResult> {
    throw new InterfaceImplementationMissingError('RpcInterface', 'rpc');
  }
}
