import { DataEnum, ScalarEnum } from './Enums';
import { InterfaceImplementationMissingError } from './errors';
import type { PublicKey, PublicKeyInput } from './PublicKey';
import type { Serializer, WrapInSerializer } from './Serializer';
import type { Nullable, Option } from './Option';

export type StructToSerializerTuple<T extends object, U extends T> = Array<
  {
    [K in keyof T]: [K, Serializer<T[K], U[K]>];
  }[keyof T]
>;

export type DataEnumToSerializerTuple<T extends DataEnum, U extends T> = Array<
  T extends any
    ? [
        T['__kind'],
        keyof Omit<T, '__kind'> extends never
          ? Serializer<Omit<T, '__kind'>, Omit<U, '__kind'>> | Serializer<void>
          : Serializer<Omit<T, '__kind'>, Omit<U, '__kind'>>
      ]
    : never
>;

export interface SerializerInterface {
  // Lists.
  tuple: <T extends any[], U extends T = T>(
    items: WrapInSerializer<[...T], [...U]>,
    description?: string
  ) => Serializer<T, U>;
  vec: <T, U extends T = T>(
    item: Serializer<T, U>,
    description?: string
  ) => Serializer<T[], U[]>;
  array: <T, U extends T = T>(
    item: Serializer<T, U>,
    size: number,
    description?: string
  ) => Serializer<T[], U[]>;

  // Maps, sets and options.
  map: <TK, TV, UK extends TK = TK, UV extends TV = TV>(
    key: Serializer<TK, UK>,
    value: Serializer<TV, UV>,
    description?: string
  ) => Serializer<Map<TK, TV>, Map<UK, UV>>;
  set: <T, U extends T = T>(
    item: Serializer<T, U>,
    description?: string
  ) => Serializer<Set<T>, Set<U>>;
  option: <T, U extends T = T>(
    item: Serializer<T, U>,
    description?: string
  ) => Serializer<Option<T>, Option<U>>;
  nullable: <T, U extends T = T>(
    item: Serializer<T, U>,
    description?: string
  ) => Serializer<Nullable<T>, Nullable<U>>;

  // Structs.
  struct: <T extends object, U extends T = T>(
    fields: StructToSerializerTuple<T, U>,
    description?: string
  ) => Serializer<T, U>;

  // Enums.
  enum<T>(constructor: ScalarEnum<T>, description?: string): Serializer<T>;
  dataEnum<T extends DataEnum, U extends T = T>(
    fields: DataEnumToSerializerTuple<T, U>,
    description?: string
  ): Serializer<T, U>;

  // Leaves.
  unit: Serializer<void>;
  bool: Serializer<boolean>;
  u8: Serializer<number>;
  u16: Serializer<number>;
  u32: Serializer<number>;
  u64: Serializer<number | bigint, bigint>;
  u128: Serializer<number | bigint, bigint>;
  i8: Serializer<number>;
  i16: Serializer<number>;
  i32: Serializer<number>;
  i64: Serializer<number | bigint, bigint>;
  i128: Serializer<number | bigint, bigint>;
  f32: Serializer<number>;
  f64: Serializer<number>;
  string: Serializer<string>;
  bytes: Serializer<Uint8Array>;
  publicKey: Serializer<PublicKey | PublicKeyInput, PublicKey>;
}

export class NullSerializer implements SerializerInterface {
  private readonly error = new InterfaceImplementationMissingError(
    'SerializerInterface',
    'serializer'
  );

  tuple<T extends any[], U extends T = T>(): Serializer<T, U> {
    throw this.error;
  }

  vec<T, U extends T = T>(): Serializer<T[], U[]> {
    throw this.error;
  }

  array<T, U extends T = T>(): Serializer<T[], U[]> {
    throw this.error;
  }

  map<TK, TV, UK extends TK = TK, UV extends TV = TV>(): Serializer<
    Map<TK, TV>,
    Map<UK, UV>
  > {
    throw this.error;
  }

  set<T, U extends T = T>(): Serializer<Set<T>, Set<U>> {
    throw this.error;
  }

  option<T, U extends T = T>(): Serializer<Option<T>, Option<U>> {
    throw this.error;
  }

  nullable<T, U extends T = T>(): Serializer<Nullable<T>, Nullable<U>> {
    throw this.error;
  }

  struct<T extends object, U extends T = T>(): Serializer<T, U> {
    throw this.error;
  }

  enum<T>(): Serializer<T> {
    throw this.error;
  }

  dataEnum<T extends DataEnum, U extends T = T>(): Serializer<T, U> {
    throw this.error;
  }

  get unit(): Serializer<void> {
    throw this.error;
  }

  get bool(): Serializer<boolean> {
    throw this.error;
  }

  get u8(): Serializer<number> {
    throw this.error;
  }

  get u16(): Serializer<number> {
    throw this.error;
  }

  get u32(): Serializer<number> {
    throw this.error;
  }

  get u64(): Serializer<number | bigint, bigint> {
    throw this.error;
  }

  get u128(): Serializer<number | bigint, bigint> {
    throw this.error;
  }

  get i8(): Serializer<number> {
    throw this.error;
  }

  get i16(): Serializer<number> {
    throw this.error;
  }

  get i32(): Serializer<number> {
    throw this.error;
  }

  get i64(): Serializer<number | bigint, bigint> {
    throw this.error;
  }

  get i128(): Serializer<number | bigint, bigint> {
    throw this.error;
  }

  get f32(): Serializer<number> {
    throw this.error;
  }

  get f64(): Serializer<number> {
    throw this.error;
  }

  get string(): Serializer<string> {
    throw this.error;
  }

  get bytes(): Serializer<Uint8Array> {
    throw this.error;
  }

  get publicKey(): Serializer<PublicKey | PublicKeyInput, PublicKey> {
    throw this.error;
  }
}
