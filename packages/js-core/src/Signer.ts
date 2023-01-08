import type { Context } from './Context';
import type { Keypair } from './KeyPair';
import { isEqualToPublicKey, PublicKey } from './PublicKey';
import { addTransactionSignature, Transaction } from './Transaction';

export type Signer = {
  publicKey: PublicKey;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
};

export const signTransaction = async (
  transaction: Transaction,
  signers: Signer[]
): Promise<Transaction> =>
  signers.reduce(async (promise, signer) => {
    const unsigned = await promise;
    return signer.signTransaction(unsigned);
  }, Promise.resolve(transaction));

export const isSigner = (value: PublicKey | Signer): value is Signer =>
  'publicKey' in value;

export const deduplicateSigners = (signers: Signer[]): Signer[] => {
  const uniquePublicKeys: PublicKey[] = [];
  return signers.reduce((all, one) => {
    const isDuplicate = uniquePublicKeys.some((key) =>
      isEqualToPublicKey(key, one.publicKey)
    );
    if (isDuplicate) return all;
    uniquePublicKeys.push(one.publicKey);
    return [...all, one];
  }, [] as Signer[]);
};

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
    return addTransactionSignature(transaction, signature, keypair.publicKey);
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
