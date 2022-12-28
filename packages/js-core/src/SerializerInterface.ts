import type { PublicKey } from './PublicKey';
import type { PublicKeyInput } from './EddsaInterface';
import type { Serializer } from './Serializer';
import type {
  DataEnumToSerializerTuple,
  DataEnumUnion,
  Option,
  ScalarEnum,
  StructToSerializerTuple,
  WrapInSerializer,
} from './TypeUtils';

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

  // Structs.
  struct: <T extends object>(
    fields: StructToSerializerTuple<T>,
    description?: string
  ) => Serializer<T>;

  // Enums.
  enum<T>(constructor: ScalarEnum<T>, description?: string): Serializer<T>;
  dataEnum<T extends DataEnumUnion>(
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
  tuple<T extends any[]>(): Serializer<T> {
    throw Error('SerializerInterface not implemented.');
  }

  vec<T>(): Serializer<T[]> {
    throw Error('SerializerInterface not implemented.');
  }

  array<T>(): Serializer<T[]> {
    throw Error('SerializerInterface not implemented.');
  }

  map<K, V>(): Serializer<Map<K, V>> {
    throw Error('SerializerInterface not implemented.');
  }

  set<T>(): Serializer<Set<T>> {
    throw Error('SerializerInterface not implemented.');
  }

  option<T>(): Serializer<Option<T>> {
    throw Error('SerializerInterface not implemented.');
  }

  struct<T extends object>(): Serializer<T> {
    throw Error('SerializerInterface not implemented.');
  }

  enum<T>(): Serializer<T> {
    throw Error('SerializerInterface not implemented.');
  }

  dataEnum<T extends DataEnumUnion>(): Serializer<T> {
    throw Error('SerializerInterface not implemented.');
  }

  get unit(): Serializer<void> {
    throw Error('SerializerInterface not implemented.');
  }

  get bool(): Serializer<boolean> {
    throw Error('SerializerInterface not implemented.');
  }

  get u8(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get u16(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get u32(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get u64(): Serializer<number | bigint, bigint> {
    throw Error('SerializerInterface not implemented.');
  }

  get u128(): Serializer<number | bigint, bigint> {
    throw Error('SerializerInterface not implemented.');
  }

  get i8(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get i16(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get i32(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get i64(): Serializer<number | bigint, bigint> {
    throw Error('SerializerInterface not implemented.');
  }

  get i128(): Serializer<number | bigint, bigint> {
    throw Error('SerializerInterface not implemented.');
  }

  get f32(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get f64(): Serializer<number> {
    throw Error('SerializerInterface not implemented.');
  }

  get string(): Serializer<string> {
    throw Error('SerializerInterface not implemented.');
  }

  get bytes(): Serializer<Uint8Array> {
    throw Error('SerializerInterface not implemented.');
  }

  get publicKey(): Serializer<PublicKey | PublicKeyInput, PublicKey> {
    throw Error('SerializerInterface not implemented.');
  }
}
