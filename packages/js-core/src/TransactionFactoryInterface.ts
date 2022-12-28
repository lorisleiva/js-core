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
  create(): Transaction {
    throw Error('TransactionFactoryInterface not implemented.');
  }

  createLegacyMessage(): LegacyTransactionMessage {
    throw Error('TransactionFactoryInterface not implemented.');
  }

  createMessageV0(): TransactionMessageV0 {
    throw Error('TransactionFactoryInterface not implemented.');
  }

  deserialize(): Transaction {
    throw Error('TransactionFactoryInterface not implemented.');
  }

  deserializeMessage(): TransactionMessage {
    throw Error('TransactionFactoryInterface not implemented.');
  }
}
