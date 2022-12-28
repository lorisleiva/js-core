import type { SolAmount } from './Amount';
import { AccountNotFoundError } from './errors';
import type { PublicKey } from './PublicKey';
import type { Serializer } from './Serializer';

export type AccountHeader = {
  executable: boolean;
  owner: PublicKey;
  lamports: SolAmount;
  rentEpoch?: number;
};

export type RpcAccount = AccountHeader & {
  address: PublicKey;
  data: Uint8Array;
};

export type MaybeRpcAccount =
  | ({ exists: true } & RpcAccount)
  | { exists: false; address: PublicKey };

export type Account<T extends object> = T & {
  address: PublicKey;
  header: AccountHeader;
};

export function deserializeAccount<T extends object>(
  rawAccount: RpcAccount,
  dataSerializer: Serializer<T>
): Account<T> {
  const { data, address, ...rest } = rawAccount;
  const [parsedData] = dataSerializer.deserialize(data);
  return { address, header: rest, ...parsedData };
}

export function assertAccountExists(
  account: MaybeRpcAccount,
  name?: string,
  solution?: string
): asserts account is MaybeRpcAccount & { exists: true } {
  if (!account.exists) {
    throw new AccountNotFoundError(account.address, name, solution);
  }
}
