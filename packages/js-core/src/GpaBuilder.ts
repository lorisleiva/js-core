import type { RpcAccount } from './Account';
import type { Context } from './Context';
import { SdkError } from './errors';
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
import { StructToSerializerTuple } from './SerializerInterface';
import { base10, base58, base64 } from './utils';

export type GpaBuilderSortCallback = (a: RpcAccount, b: RpcAccount) => number;
export type GpaBuilderMapCallback<T> = (account: RpcAccount) => T;

export class GpaBuilder<
  Account extends object = RpcAccount,
  Fields extends object = {}
> {
  constructor(
    protected readonly context: Pick<Context, 'rpc'>,
    readonly programId: PublicKey,
    readonly fields?: StructToSerializerTuple<Fields, Fields>,
    readonly options: {
      sortCallback?: GpaBuilderSortCallback;
      deserializeCallback?: GpaBuilderMapCallback<Account>;
      dataSlice?: RpcDataSlice;
      filters?: RpcDataFilter[];
    } = {}
  ) {}

  reset(): GpaBuilder<Account, Fields> {
    return new GpaBuilder<Account, Fields>(
      this.context,
      this.programId,
      this.fields,
      {}
    );
  }

  slice(offset: number, length: number): GpaBuilder<Account, Fields> {
    return new GpaBuilder<Account, Fields>(
      this.context,
      this.programId,
      this.fields,
      {
        ...this.options,
        dataSlice: { offset, length },
      }
    );
  }

  withoutData(): GpaBuilder<Account, Fields> {
    return this.slice(0, 0);
  }

  addFilter(...filters: RpcDataFilter[]): GpaBuilder<Account, Fields> {
    return new GpaBuilder<Account, Fields>(
      this.context,
      this.programId,
      this.fields,
      {
        ...this.options,
        filters: [...(this.options.filters ?? []), ...filters],
      }
    );
  }

  where(
    offset: number,
    data: string | bigint | number | boolean | Uint8Array | PublicKey
  ): GpaBuilder<Account, Fields> {
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

  whereField<K extends keyof Fields>(
    field: K,
    data: Fields[K],
    offset?: number
  ): GpaBuilder<Account, Fields> {
    if (!this.fields) {
      throw new SdkError('Fields are not defined in this GpaBuilder.');
    }

    const fieldIndex = this.fields.findIndex(([name]) => name === field);
    if (fieldIndex < 0) {
      throw new SdkError(
        `Field [${field as string}] is not defined in this GpaBuilder.`
      );
    }

    const [, serializer] = this.fields[fieldIndex];
    if (offset !== undefined) {
      return this.where(offset, serializer.serialize(data));
    }

    const computedOffset = this.fields
      .slice(0, fieldIndex)
      .reduce(
        (acc, [, s]) =>
          acc === null || s.fixedSize === null ? null : acc + s.fixedSize,
        0 as number | null
      );

    if (computedOffset === null) {
      throw new SdkError(
        `Field [${field as string}] is not in the fixed part of ` +
          `the account's data. In other words, it is located after ` +
          `a field of variable length which means we cannot find a ` +
          `fixed offset for the filter.`
      );
    }

    return this.where(computedOffset, serializer.serialize(data));
  }

  whereSize(dataSize: number): GpaBuilder<Account, Fields> {
    return this.addFilter({ dataSize });
  }

  sortUsing(callback: GpaBuilderSortCallback): GpaBuilder<Account, Fields> {
    return new GpaBuilder(this.context, this.programId, this.fields, {
      ...this.options,
      sortCallback: callback,
    });
  }

  deserializeUsing<T extends object>(
    callback: GpaBuilderMapCallback<T>
  ): GpaBuilder<T, Fields> {
    return new GpaBuilder<T, Fields>(
      this.context,
      this.programId,
      this.fields,
      {
        ...this.options,
        deserializeCallback: callback,
      }
    );
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
    callback: GpaBuilderMapCallback<T>,
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
        const message =
          `Following a getProgramAccount call, you are trying to use an ` +
          `account's data (or a slice of it) as a public key. ` +
          `However, we encountered an account ` +
          `[${base58PublicKey(account.publicKey)}] whose data ` +
          `[base64=${base64.deserialize(account.data)}] ` +
          `is not a valid public key.`;
        throw new SdkError(message);
      }
    }, options);
  }
}

export const gpaBuilder = <
  Account extends object = RpcAccount,
  Fields extends object = {}
>(
  context: Pick<Context, 'rpc'>,
  programId: PublicKey,
  fields?: StructToSerializerTuple<Fields, Fields>
): GpaBuilder<Account, Fields> =>
  new GpaBuilder<Account, Fields>(context, programId, fields);
