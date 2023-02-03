import { base58, Transaction } from '@lorisleiva/js-core';
import {
  Message as Web3JsMessage,
  Transaction as Web3JsLegacyTransaction,
  VersionedTransaction as Web3JsTransaction,
} from '@solana/web3.js';
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

export function fromWeb3JsLegacyTransaction(
  transaction: Web3JsLegacyTransaction
): Transaction {
  const message = transaction.compileMessage();
  return {
    message: fromWeb3JsMessage(message),
    serializedMessage: message.serialize(),
    signatures: transaction.signatures.map(
      (signature) => new Uint8Array(signature.signature as Buffer)
    ),
  };
}

export function toWeb3JsLegacyTransaction(
  transaction: Transaction
): Web3JsLegacyTransaction {
  const web3JsTransaction = toWeb3JsTransaction(transaction);
  return Web3JsLegacyTransaction.populate(
    web3JsTransaction.message as Web3JsMessage,
    web3JsTransaction.signatures.map(
      (signature) => base58.deserialize(signature)[0]
    )
  );
}
