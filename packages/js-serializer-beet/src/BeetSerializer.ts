/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Option,
  ScalarEnum,
  Serializer,
  SerializerInterface,
  StructToSerializerTuple,
  WrapInSerializer,
} from '@lorisleiva/js-core';

export class BeetSerializer implements SerializerInterface {
  tuple<T extends any[]>(
    items: [...WrapInSerializer<T>],
    description?: string
  ): Serializer<T> {
    throw new Error('Method not implemented.');
  }

  vec<T>(item: Serializer<T>, description?: string): Serializer<T[]> {
    throw new Error('Method not implemented.');
  }

  array<T>(
    item: Serializer<T>,
    size: number,
    description?: string
  ): Serializer<T[]> {
    throw new Error('Method not implemented.');
  }

  map<K, V>(
    key: Serializer<K>,
    value: Serializer<V>,
    description?: string
  ): Serializer<Map<K, V>> {
    throw new Error('Method not implemented.');
  }

  set<T>(item: Serializer<T>, description?: string): Serializer<Set<T>> {
    throw new Error('Method not implemented.');
  }

  option<T>(item: Serializer<T>, description?: string): Serializer<Option<T>> {
    throw new Error('Method not implemented.');
  }

  struct<T extends object>(
    fields: StructToSerializerTuple<T>,
    description?: string
  ): Serializer<T> {
    throw new Error('Method not implemented.');
  }

  enum<T>(constructor: ScalarEnum<T>, description?: string): Serializer<T> {
    throw new Error('Method not implemented.');
  }

  // dataEnum<T extends DataEnumUnion>(fields: DataEnumToSerializerTuple<T>, description?: string | undefined): Serializer<T, T> {
  //   //
  // }
  // get bool(): Serializer<boolean, boolean>{
  //   //
  // }
  // get u8(): Serializer<number, number>{
  //   //
  // }
  // get u16(): Serializer<number, number>{
  //   //
  // }
  // get u32(): Serializer<number, number>{
  //   //
  // }
  // get u64(): Serializer<number | bigint, bigint>{
  //   //
  // }
  // get u128(): Serializer<number | bigint, bigint>{
  //   //
  // }
  // get i8(): Serializer<number, number>{
  //   //
  // }
  // get i16(): Serializer<number, number>{
  //   //
  // }
  // get i32(): Serializer<number, number>{
  //   //
  // }
  // get i64(): Serializer<number | bigint, bigint>{
  //   //
  // }
  // get i128(): Serializer<number | bigint, bigint>{
  //   //
  // }
  // get f32(): Serializer<number, number>{
  //   //
  // }
  // get f64(): Serializer<number, number>{
  //   //
  // }
  // get string(): Serializer<string, string>{
  //   //
  // }
  // get bytes(): Serializer<Uint8Array, Uint8Array>{
  //   //
  // }
  // get publicKey(): Serializer<PublicKey | PublicKeyInput, PublicKey>{
  //   //
  // }
}
