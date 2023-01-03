import {
  Instruction,
  PublicKey,
  Transaction,
  TransactionFactoryInterface,
  TransactionInput,
  TransactionMessage,
} from '@lorisleiva/js-core';
import {
  AddressLookupTableAccount as Web3JsAddressLookupTableAccount,
  Message as Web3JsMessageLegacy,
  MessageV0 as Web3JsMessageV0,
  PublicKey as Web3JsPublicKey,
  TransactionInstruction as Web3JsTransactionInstruction,
  VersionedTransaction as Web3JsTransaction,
} from '@solana/web3.js';

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
