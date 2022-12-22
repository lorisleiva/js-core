import type { SolAmount } from './Amount';
import { AccountNotFoundError } from './errors';
import type { PublicKey } from './PublicKey';

export type AccountHeader = {
  executable: boolean;
  owner: PublicKey;
  lamports: SolAmount;
  rentEpoch?: number;
};

// Raw accounts.
export type RpcAccount = AccountHeader & {
  publicKey: PublicKey;
  data: Uint8Array;
};
export type MaybeRpcAccount =
  | ({ exists: true } & RpcAccount)
  | { exists: false; address: PublicKey };

// Parsed accounts.
export type Account<T extends object> = T & {
  address: PublicKey;
  header: AccountHeader;
};
export type MaybeAccount<T extends object> =
  | ({ exists: true } & Account<T>)
  | { exists: false; address: PublicKey };

export function assertAccountExists<
  T extends object,
  A extends MaybeAccount<T> | MaybeRpcAccount
>(
  account: A,
  name?: string,
  solution?: string
): asserts account is A & { exists: true } {
  if (!account.exists) {
    throw new AccountNotFoundError(account.address, name, solution);
  }
}
