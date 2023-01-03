import type { Context } from './Context';
import type { Keypair } from './KeyPair';
import { isEqualToPublicKey, PublicKey } from './PublicKey';
import type { Transaction } from './Transaction';

export type Signer = {
  publicKey: PublicKey;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
};

export const isSigner = (value: PublicKey | Signer): value is Signer =>
  'publicKey' in value;

export const createSignerFromKeypair = (
  context: Pick<Context, 'eddsa' | 'transactions'>,
  keypair: Keypair
): Signer => ({
  publicKey: keypair.publicKey,
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return context.eddsa.sign(message, keypair);
  },
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const message = transaction.serializedMessage;
    const signature = context.eddsa.sign(message, keypair);

    const maxSigners = transaction.message.header.numRequiredSignatures;
    const signerPublicKeys = transaction.message.accounts.slice(0, maxSigners);
    const signerIndex = signerPublicKeys.findIndex((key) =>
      isEqualToPublicKey(key, keypair.publicKey)
    );

    if (signerIndex < 0) {
      throw new Error(
        'The provided signer is not required to sign this transaction.'
      );
    }

    const newSignatures = [...transaction.signatures];
    newSignatures[signerIndex] = signature;
    return { ...transaction, signatures: newSignatures };
  },
  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    return Promise.all(
      transactions.map((transaction) => this.signTransaction(transaction))
    );
  },
});

export const createNoopSigner = (publicKey: PublicKey): Signer => ({
  publicKey,
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return message;
  },
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    return transaction;
  },
  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    return transactions;
  },
});

export const createNullSigner = (): Signer => new NullSigner();

export class NullSigner implements Signer {
  // TODO(loris): Custom errors.
  get publicKey(): PublicKey {
    throw new Error('Method not implemented.');
  }

  signMessage(): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  signTransaction(): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }

  signAllTransactions(): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
}
