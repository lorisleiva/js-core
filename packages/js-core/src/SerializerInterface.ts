import type { PublicKey } from './PublicKey';
import type { PublicKeyInput } from './EddsaInterface';
import type { Serializer } from './Serializer';
import type { Context } from './Context';
import type { WrapInSerializer } from './TypeUtils';

export type ScalarEnum<T> = Record<keyof T, number | string> & {
  [k: number]: string;
};

export type DataEnumUnion = { __kind: string };

export type DataEnumRecord<T extends DataEnumUnion> = {
  [P in T['__kind']]: Extract<T, { __kind: P }>;
};

export type StructToSerializerTuple<T extends object> = Array<
  {
    [K in keyof T]: T[K] extends undefined ? [K] : [K, Serializer<T[K]>];
  }[keyof T]
>;

export type DataEnumToSerializerTuple<T extends DataEnumUnion> = Array<
  T extends any ? [T['__kind'], Serializer<Omit<T, '__kind'>>] : never
>;

// export type DataEnumSerializerRecord<T extends DataEnumUnion> =
//   WrapInSerializer<DataEnumRecord<T>>;

// export type DataEnumSerializerTuple<T extends DataEnumUnion> = RecordToTuple<
//   DataEnumSerializerRecord<T>
// >;

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
  ) => Serializer<T | null>;

  // Structs.
  struct: <T extends object>(
    fields: StructToSerializerTuple<T>,
    description?: string
  ) => Serializer<T>;

  // Enums.
  enum<T extends ScalarEnum<T>>(
    constructor: T,
    description?: string
  ): Serializer<T>;
  dataEnum<T extends DataEnumUnion>(
    fields: DataEnumToSerializerTuple<T>,
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
  string: Serializer<string>;
  bytes: Serializer<Uint8Array>;

  // Extra leaves.
  publicKey(
    context: Pick<Context, 'eddsa'>
  ): Serializer<PublicKey | PublicKeyInput, PublicKey>;
}

const foo = {} as SerializerInterface;
const bar = foo.dataEnum<
  { __kind: 'V1'; a: number } | { __kind: 'V2'; b: string }
>([
  ['V1', foo.struct<{ a: number }>([['a', foo.u8]])],
  ['V2', foo.struct<{ b: string }>([['b', foo.string]])],
]);

type T1 = { a: number; b: string };
type T2 = StructToSerializerTuple<T1>;

type T3 = { __kind: 'V1'; a: number } | { __kind: 'V2'; b: string };
type T4 = DataEnumToSerializerTuple<T3>;
