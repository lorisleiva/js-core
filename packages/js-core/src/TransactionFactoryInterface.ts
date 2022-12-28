import { InterfaceImplementationMissingError } from './errors';
import type { Instruction } from './Instruction';
import type { PublicKey } from './PublicKey';
import type {
  Blockhash,
  LegacyTransactionMessage,
  SerializedTransaction,
  Transaction,
  TransactionMessage,
  TransactionMessageV0,
} from './Transaction';

export interface TransactionFactoryInterface {
  create(message: TransactionMessage, signatures?: Uint8Array[]): Transaction;
  createLegacyMessage(
    args: LegacyTransactionMessageArgs
  ): LegacyTransactionMessage;
  createMessageV0(args: TransactionMessageV0Args): TransactionMessageV0;
  deserialize(serializedTransaction: SerializedTransaction): Transaction;
  deserializeMessage(serializedMessage: Uint8Array): TransactionMessage;
}

export type LegacyTransactionMessageArgs = {
  payerKey: PublicKey;
  instructions: Instruction[];
  recentBlockhash: Blockhash;
};

export type TransactionMessageV0Args = {
  payerKey: PublicKey;
  instructions: Instruction[];
  recentBlockhash: Blockhash;
  addressLookupTableAccounts?: AddressLookupTableAccount[];
};

export interface AddressLookupTableAccount {
  key: PublicKey;
  state: AddressLookupTableState;
  isActive(): boolean;
}

export type AddressLookupTableState = {
  deactivationSlot: bigint;
  lastExtendedSlot: number;
  lastExtendedSlotStartIndex: number;
  authority?: PublicKey;
  addresses: PublicKey[];
};

export class NullTransactionFactory implements TransactionFactoryInterface {
  private readonly error = new InterfaceImplementationMissingError(
    'TransactionFactoryInterface',
    'transactions'
  );

  create(): Transaction {
    throw this.error;
  }

  createLegacyMessage(): LegacyTransactionMessage {
    throw this.error;
  }

  createMessageV0(): TransactionMessageV0 {
    throw this.error;
  }

  deserialize(): Transaction {
    throw this.error;
  }

  deserializeMessage(): TransactionMessage {
    throw this.error;
  }
}
