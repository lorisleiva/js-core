import {
  Transaction,
  TransactionFactoryInterface,
  TransactionInput,
} from '@lorisleiva/js-core';
import {
  fromWeb3JsMessage,
  fromWeb3JsTransaction,
  toWeb3JsMessageFromInput,
  toWeb3JsTransaction,
} from '@lorisleiva/js-web3js-adapters';
import { VersionedTransaction as Web3JsTransaction } from '@solana/web3.js';

export class Web3JsTransactionFactory implements TransactionFactoryInterface {
  create(input: TransactionInput): Transaction {
    const web3JsMessage = toWeb3JsMessageFromInput(input);
    return {
      message: fromWeb3JsMessage(web3JsMessage),
      serializedMessage: web3JsMessage.serialize(),
      signatures: input.signatures ?? [],
    };
  }

  serialize(transaction: Transaction): Uint8Array {
    return toWeb3JsTransaction(transaction).serialize();
  }

  deserialize(serializedTransaction: Uint8Array): Transaction {
    return fromWeb3JsTransaction(
      Web3JsTransaction.deserialize(serializedTransaction)
    );
  }
}
