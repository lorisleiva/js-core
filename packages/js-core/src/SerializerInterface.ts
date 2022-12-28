import type { PublicKey } from './PublicKey';
import type { PublicKeyInput } from './EddsaInterface';
import type { Serializer } from './Serializer';
import type {
  DataEnumToSerializerTuple,
  DataEnumUnion,
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
  ) => Serializer<T | null>;

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
