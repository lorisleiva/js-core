import { InterfaceImplementationMissingError } from './errors';
import type {
  SerializedTransaction,
  Transaction,
  TransactionInput,
} from './Transaction';

export interface TransactionFactoryInterface {
  create(input: TransactionInput): Transaction;
  serialize(transaction: Transaction): SerializedTransaction;
  deserialize(serializedTransaction: SerializedTransaction): Transaction;
}

export class NullTransactionFactory implements TransactionFactoryInterface {
  private readonly error = new InterfaceImplementationMissingError(
    'TransactionFactoryInterface',
    'transactions'
  );

  create(): Transaction {
    throw this.error;
  }

  serialize(): SerializedTransaction {
    throw this.error;
  }

  deserialize(): Transaction {
    throw this.error;
  }
}
