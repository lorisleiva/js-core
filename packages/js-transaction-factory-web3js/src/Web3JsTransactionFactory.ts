import {
  Instruction,
  LegacyTransactionMessage,
  LegacyTransactionMessageArgs,
  PublicKey,
  Transaction,
  TransactionFactoryInterface,
  TransactionMessage,
  TransactionMessageV0,
  TransactionMessageV0Args,
} from '@lorisleiva/js-core';
import {
  CompileV0Args as Web3JsV0Args,
  Message as Web3JsMessageLegacy,
  MessageV0 as Web3JsMessageV0,
  PublicKey as Web3JsPublicKey,
  TransactionInstruction as Web3JsTransactionInstruction,
  VersionedMessage as Web3JsMessage,
  VersionedTransaction as Web3JsTransaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';

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
    const web3JsMessage = Web3JsMessageLegacy.compile({
      payerKey: toWeb3JsPublicKey(args.payerKey),
      instructions: args.instructions.map(toWeb3JsInstruction),
      recentBlockhash: args.recentBlockhash,
    });

    return fromWebJsLegacyMessage(web3JsMessage);
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

function fromWeb3JsPublicKey(publicKey: Web3JsPublicKey): PublicKey {
  return { bytes: publicKey.toBytes() };
}

function toWeb3JsPublicKey(publicKey: PublicKey): Web3JsPublicKey {
  return new Web3JsPublicKey(publicKey.bytes);
}

function toWeb3JsInstruction(
  instruction: Instruction
): Web3JsTransactionInstruction {
  return new Web3JsTransactionInstruction({
    keys: instruction.keys.map((accountMeta) => ({
      ...accountMeta,
      pubkey: toWeb3JsPublicKey(accountMeta.pubkey),
    })),
    programId: toWeb3JsPublicKey(instruction.programId),
    data: Buffer.from(instruction.data),
  });
}

function fromWebJsLegacyMessage(
  message: Web3JsMessageLegacy
): LegacyTransactionMessage {
  return {
    version: 'legacy',
    staticAccountKeys: message.staticAccountKeys.map(fromWeb3JsPublicKey),
    recentBlockhash: message.recentBlockhash,
    compiledInstructions: message.compiledInstructions,
    addressTableLookups: message.addressTableLookups.map((lookup) => ({
      ...lookup,
      accountKey: fromWeb3JsPublicKey(lookup.accountKey),
    })),
    isAccountSigner: message.isAccountSigner.bind(message),
    isAccountWritable: message.isAccountWritable.bind(message),
    serialize: message.serialize.bind(message),
  };
}
