import type { PublicKeyInput } from './EddsaInterface';
import { DataEnum, ScalarEnum } from './Enums';
import { InterfaceImplementationMissingError } from './errors';
import type { PublicKey } from './PublicKey';
import type { Serializer, WrapInSerializer } from './Serializer';
import type { Nullable, Option } from './Option';

export type StructToSerializerTuple<T extends object> = Array<
  {
    [K in keyof T]: [K, Serializer<T[K]>];
  }[keyof T]
>;

export type DataEnumToSerializerTuple<T extends DataEnum> = Array<
  T extends any
    ? [
        T['__kind'],
        keyof Omit<T, '__kind'> extends never
          ? Serializer<Omit<T, '__kind'>> | Serializer<void>
          : Serializer<Omit<T, '__kind'>>
      ]
    : never
>;

export interface SerializerInterface {
  // Lists.
  tuple: <T extends any[]>(
    items: WrapInSerializer<[...T]>,
    description?: string
  ) => Serializer<T>;
  vec: <T>(item: Serializer<T>, description?: string) => Serializer<T[]>;
  array: <T>(
    item: Serializer<T>,
    size: number,
    description?: string
  ) => Serializer<T[]>;

  // Maps, sets and options.
  map: <K, V>(
    key: Serializer<K>,
    value: Serializer<V>,
    description?: string
  ) => Serializer<Map<K, V>>;
  set: <T>(item: Serializer<T>, description?: string) => Serializer<Set<T>>;
  option: <T>(
    item: Serializer<T>,
    description?: string
  ) => Serializer<Option<T>>;
  nullable: <T>(
    item: Serializer<T>,
    description?: string
  ) => Serializer<Nullable<T>>;

  // Structs.
  struct: <T extends object>(
    fields: StructToSerializerTuple<T>,
    description?: string
  ) => Serializer<T>;

  // Enums.
  enum<T>(constructor: ScalarEnum<T>, description?: string): Serializer<T>;
  dataEnum<T extends DataEnum>(
    fields: DataEnumToSerializerTuple<T>,
    description?: string
  ): Serializer<T>;

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

  tuple<T extends any[]>(): Serializer<T> {
    throw this.error;
  }

  vec<T>(): Serializer<T[]> {
    throw this.error;
  }

  array<T>(): Serializer<T[]> {
    throw this.error;
  }

  map<K, V>(): Serializer<Map<K, V>> {
    throw this.error;
  }

  set<T>(): Serializer<Set<T>> {
    throw this.error;
  }

  option<T>(): Serializer<Option<T>> {
    throw this.error;
  }

  nullable<T>(): Serializer<Nullable<T>> {
    throw this.error;
  }

  struct<T extends object>(): Serializer<T> {
    throw this.error;
  }

  enum<T>(): Serializer<T> {
    throw this.error;
  }

  dataEnum<T extends DataEnum>(): Serializer<T> {
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
