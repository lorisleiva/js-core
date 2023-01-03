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
import bs58 from 'bs58';
import { Buffer } from 'buffer';

export class Web3JsTransactionFactory implements TransactionFactoryInterface {
  create(input: TransactionInput): Transaction {
    const web3JsMessage = toWeb3JsMessageFromInput(input);
    return {
      message: fromWebJsMessage(web3JsMessage),
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

function fromWebJsMessage(
  message: Web3JsMessageLegacy | Web3JsMessageV0
): TransactionMessage {
  return {
    version: message.version,
    header: message.header,
    accounts: message.staticAccountKeys.map(fromWeb3JsPublicKey),
    recentBlockhash: message.recentBlockhash,
    instructions: message.compiledInstructions.map((instruction) => ({
      programIndex: instruction.programIdIndex,
      accountIndexes: instruction.accountKeyIndexes,
      data: instruction.data,
    })),
    addressLookupTables: message.addressTableLookups.map((lookup) => ({
      address: fromWeb3JsPublicKey(lookup.accountKey),
      writableIndexes: lookup.writableIndexes,
      readonlyIndexes: lookup.readonlyIndexes,
    })),
  };
}

function toWeb3JsMessageFromInput(
  input: TransactionInput
): Web3JsMessageLegacy | Web3JsMessageV0 {
  if (input.version === 'legacy') {
    return Web3JsMessageLegacy.compile({
      payerKey: toWeb3JsPublicKey(input.payer),
      instructions: input.instructions.map(toWeb3JsInstruction),
      recentBlockhash: input.recentBlockhash,
    });
  }

  return Web3JsMessageV0.compile({
    payerKey: toWeb3JsPublicKey(input.payer),
    instructions: input.instructions.map(toWeb3JsInstruction),
    recentBlockhash: input.recentBlockhash,
    addressLookupTableAccounts: input.addressLookupTables?.map(
      (account) =>
        new Web3JsAddressLookupTableAccount({
          key: toWeb3JsPublicKey(account.address),
          state: {
            ...account,
            authority: account.authority
              ? toWeb3JsPublicKey(account.authority)
              : undefined,
            addresses: account.addresses.map(toWeb3JsPublicKey),
          },
        })
    ),
  });
}

function toWeb3JsMessage(
  message: TransactionMessage
): Web3JsMessageLegacy | Web3JsMessageV0 {
  if (message.version === 'legacy') {
    return new Web3JsMessageLegacy({
      header: message.header,
      accountKeys: message.accounts.map(toWeb3JsPublicKey),
      recentBlockhash: message.recentBlockhash,
      instructions: message.instructions.map((instruction) => ({
        programIdIndex: instruction.programIndex,
        accounts: instruction.accountIndexes,
        data: bs58.encode(instruction.data),
      })),
    });
  }

  return new Web3JsMessageV0({
    header: message.header,
    staticAccountKeys: message.accounts.map(toWeb3JsPublicKey),
    recentBlockhash: message.recentBlockhash,
    compiledInstructions: message.instructions.map((instruction) => ({
      programIdIndex: instruction.programIndex,
      accountKeyIndexes: instruction.accountIndexes,
      data: instruction.data,
    })),
    addressTableLookups: message.addressLookupTables.map((lookup) => ({
      accountKey: toWeb3JsPublicKey(lookup.address),
      writableIndexes: lookup.writableIndexes,
      readonlyIndexes: lookup.readonlyIndexes,
    })),
  });
}

function fromWeb3JsTransaction(transaction: Web3JsTransaction): Transaction {
  return {
    message: fromWebJsMessage(transaction.message),
    serializedMessage: transaction.message.serialize(),
    signatures: transaction.signatures,
  };
}

function toWeb3JsTransaction(transaction: Transaction): Web3JsTransaction {
  return new Web3JsTransaction(
    toWeb3JsMessage(transaction.message),
    transaction.signatures
  );
}
