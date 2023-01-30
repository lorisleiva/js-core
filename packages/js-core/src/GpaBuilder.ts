import type { RpcAccount } from './Account';
import type { Context } from './Context';
import {
  base58PublicKey,
  isPublicKey,
  publicKey,
  PublicKey,
} from './PublicKey';
import type {
  RpcDataFilter,
  RpcDataSlice,
  RpcGetProgramAccountsOptions,
} from './RpcInterface';
import { base10, base58, base64 } from './utils';

export type GpaBuilderSortCallback = (a: RpcAccount, b: RpcAccount) => number;

export class GpaBuilder {
  constructor(
    protected readonly context: Pick<Context, 'rpc'>,
    protected readonly programId: PublicKey,
    protected readonly options: {
      sortCallback?: GpaBuilderSortCallback;
      dataSlice?: RpcDataSlice;
      filters?: RpcDataFilter[];
    } = {}
  ) {}

  reset(): GpaBuilder {
    return new GpaBuilder(this.context, this.programId, {});
  }

  slice(offset: number, length: number): GpaBuilder {
    return new GpaBuilder(this.context, this.programId, {
      ...this.options,
      dataSlice: { offset, length },
    });
  }

  withoutData(): GpaBuilder {
    return this.slice(0, 0);
  }

  addFilter(...filters: RpcDataFilter[]) {
    return new GpaBuilder(this.context, this.programId, {
      ...this.options,
      filters: [...(this.options.filters ?? []), ...filters],
    });
  }

  where(
    offset: number,
    data: string | bigint | number | boolean | Uint8Array | PublicKey
  ) {
    let bytes: Uint8Array;
    if (typeof data === 'string') {
      bytes = base58.serialize(data);
    } else if (
      typeof data === 'number' ||
      typeof data === 'bigint' ||
      typeof data === 'boolean'
    ) {
      bytes = base10.serialize(BigInt(data).toString());
    } else if (isPublicKey(data)) {
      bytes = new Uint8Array(data.bytes);
    } else {
      bytes = new Uint8Array(data);
    }

    return this.addFilter({ memcmp: { offset, bytes } });
  }

  whereSize(dataSize: number) {
    return this.addFilter({ dataSize });
  }

  sortUsing(callback: GpaBuilderSortCallback) {
    return new GpaBuilder(this.context, this.programId, {
      ...this.options,
      sortCallback: callback,
    });
  }

  async get(options: RpcGetProgramAccountsOptions = {}): Promise<RpcAccount[]> {
    const accounts = await this.context.rpc.getProgramAccounts(this.programId, {
      ...options,
      dataSlice: options.dataSlice ?? this.options.dataSlice,
      filters: [...(options.filters ?? []), ...(this.options.filters ?? [])],
    });

    if (this.options.sortCallback) {
      accounts.sort(this.options.sortCallback);
    }

    return accounts;
  }

  async getAndMap<T>(
    callback: (account: RpcAccount) => T,
    options: RpcGetProgramAccountsOptions = {}
  ): Promise<T[]> {
    return (await this.get(options)).map(callback);
  }

  async getPublicKeys(
    options: RpcGetProgramAccountsOptions = {}
  ): Promise<PublicKey[]> {
    return this.getAndMap((account) => account.publicKey, options);
  }

  async getDataAsPublicKeys(
    options: RpcGetProgramAccountsOptions = {}
  ): Promise<PublicKey[]> {
    return this.getAndMap((account) => {
      try {
        return publicKey(account.data);
      } catch (error) {
        // TODO: Custom error.
        const message =
          `Following a getProgramAccount call, you are trying to use a slice ` +
          `of an account's data as a public key. However, we encountered an account ` +
          `[${base58PublicKey(account.publicKey)}] whose data ` +
          `[base64=${base64.deserialize(
            account.data
          )}] is not a valid public key.`;
        throw new Error(message);
      }
    }, options);
  }
}
