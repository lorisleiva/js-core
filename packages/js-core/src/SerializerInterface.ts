import type { PublicKey } from './PublicKey';
import type { PublicKeyInput } from './EddsaInterface';
import type { Serializer } from './Serializer';
import type { Context } from './Context';
import { RecordToTuple, WrapInSerializer } from './TypeUtils';

export type ScalarEnum<T> = Record<keyof T, number | string> & {
  [k: number]: string;
};

export type DataEnumUnion = { __kind: string };

export type DataEnumRecord<T extends { __kind: string }> = {
  [P in T['__kind']]: Extract<T, { __kind: P }>;
};

export type DataEnumSerializerRecord<T extends DataEnumUnion> =
  WrapInSerializer<DataEnumRecord<T>>;

export type DataEnumSerializerTuple<T extends DataEnumUnion> = RecordToTuple<
  DataEnumSerializerRecord<T>
>;

export interface SerializerInterface {
  // Lists.
  // TODO(loris): Link tuple with serializer items (remove any).
  tuple: <T>(items: Serializer<any>[], description?: string) => Serializer<T>;
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
  ) => Serializer<T | null>;

  // Structs.
  // TODO(loris): Link struct with serializer fields (remove any).
  struct: <T extends object>(
    fields: [keyof T, Serializer<any>][],
    description?: string
  ) => Serializer<T>;

  // Enums.
  enum<T extends ScalarEnum<T>>(
    constructor: T,
    description?: string
  ): Serializer<T>;
  dataEnum<T extends DataEnumUnion>(
    fields: DataEnumSerializerTuple<T>,
    description?: string
  ): Serializer<T>;

  // Leaves.
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
  string: Serializer<number>;
  bytes: Serializer<Uint8Array>;

  // Extra leaves.
  publicKey(
    context: Pick<Context, 'eddsa'>
  ): Serializer<PublicKey | PublicKeyInput, PublicKey>;
}
