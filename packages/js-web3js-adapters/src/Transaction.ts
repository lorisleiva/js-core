import { Transaction } from '@lorisleiva/js-core';
import { VersionedTransaction as Web3JsTransaction } from '@solana/web3.js';
import { fromWeb3JsMessage, toWeb3JsMessage } from './TransactionMessage';

export function fromWeb3JsTransaction(
  transaction: Web3JsTransaction
): Transaction {
  return {
    message: fromWeb3JsMessage(transaction.message),
    serializedMessage: transaction.message.serialize(),
    signatures: transaction.signatures,
  };
}

export function toWeb3JsTransaction(
  transaction: Transaction
): Web3JsTransaction {
  return new Web3JsTransaction(
    toWeb3JsMessage(transaction.message),
    transaction.signatures
  );
}
