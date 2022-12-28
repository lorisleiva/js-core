import {
  LegacyTransactionMessage,
  LegacyTransactionMessageArgs,
  Transaction,
  TransactionFactoryInterface,
  TransactionMessage,
  TransactionMessageV0,
  TransactionMessageV0Args,
} from '@lorisleiva/js-core';
import {
  CompileLegacyArgs as Web3JsLegacyArgs,
  CompileV0Args as Web3JsV0Args,
  Message as Web3JsMessageLegacy,
  MessageV0 as Web3JsMessageV0,
  VersionedMessage as Web3JsMessage,
  VersionedTransaction as Web3JsTransaction,
} from '@solana/web3.js';

export class Web3JsTransactionFactory implements TransactionFactoryInterface {
  create(
    message: TransactionMessage,
    signatures?: Uint8Array[] | undefined
  ): Transaction {
    return new Web3JsTransaction(message as Web3JsMessage, signatures);
  }

  createLegacyMessage(
    args: LegacyTransactionMessageArgs
  ): LegacyTransactionMessage {
    return Web3JsMessageLegacy.compile(args as Web3JsLegacyArgs);
  }

  createMessageV0(args: TransactionMessageV0Args): TransactionMessageV0 {
    return Web3JsMessageV0.compile(args as Web3JsV0Args);
  }

  deserialize(serializedTransaction: Uint8Array): Transaction {
    return Web3JsTransaction.deserialize(serializedTransaction);
  }

  deserializeMessage(serializedMessage: Uint8Array): TransactionMessage {
    return Web3JsMessage.deserialize(serializedMessage);
  }
}
