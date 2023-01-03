import type { Instruction } from './Instruction';
import type { PublicKey } from './PublicKey';

export type TransactionVersion = 'legacy' | 0;
export type SerializedTransaction = Uint8Array;
export type SerializedTransactionMessage = Uint8Array;
export type TransactionSignature = Uint8Array;
export type TransactionError = {} | string;
export type Blockhash = string;

export interface Transaction {
  readonly signatures: TransactionSignature[];
  readonly message: TransactionMessage;
  readonly serializedMessage: SerializedTransactionMessage;
}

export interface TransactionMessage {
  readonly version: TransactionVersion;
  readonly accounts: PublicKey[];
  readonly recentBlockhash: Blockhash;
  readonly instructions: CompiledInstruction[];
  readonly addressLookupTables: CompiledAddressLookupTable[];
  readonly signerIndexes: number[];
  readonly writableIndexes: number[];
}

export type CompiledInstruction = {
  readonly programIndex: number;
  readonly accountIndexes: number[];
  readonly data: Uint8Array;
};

export type CompiledAddressLookupTable = {
  readonly publicKey: PublicKey;
  readonly writableIndexes: number[];
  readonly readonlyIndexes: number[];
};

export type TransactionInput = TransactionInputLegacy | TransactionInputV0;

export type TransactionInputLegacy = TransactionInputBase & {
  version: 'legacy';
};

export type TransactionInputV0 = TransactionInputBase & {
  version?: 0;
  addressLookupTables?: AddressLookupTableInput[];
};

export type TransactionInputBase = {
  payer: PublicKey;
  instructions: Instruction[];
  recentBlockhash: Blockhash;
  signatures?: TransactionSignature[];
};

export type AddressLookupTableInput = {
  address: PublicKey;
  addresses: PublicKey[];
  deactivationSlot: bigint;
  lastExtendedSlot: number;
  lastExtendedSlotStartIndex: number;
  authority?: PublicKey;
};
