/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataEnumToSerializerTuple,
  DataEnumUnion,
  Option,
  PublicKey,
  PublicKeyInput,
  ScalarEnum,
  Serializer,
  SerializerInterface,
  StructToSerializerTuple,
  toBigInt,
  WrapInSerializer,
} from '@lorisleiva/js-core';
import * as beet from '@metaplex-foundation/beet';
import { Buffer } from 'buffer';
import { OperationNotSupportedError } from './errors';
// import * as beetSolana from '@metaplex-foundation/beet-solana';

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

  dataEnum<T extends DataEnumUnion>(
    fields: DataEnumToSerializerTuple<T>,
    description?: string
  ): Serializer<T> {
    throw new Error('Method not implemented.');
  }

  get bool(): Serializer<boolean> {
    throw new Error('Method not implemented.');
  }

  get u8(): Serializer<number> {
    return {
      description: beet.u8.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.u8.byteSize);
        beet.u8.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.u8.read(buffer, offset);
        return [value, offset + beet.u8.byteSize];
      },
    };
  }

  get u16(): Serializer<number> {
    return {
      description: beet.u16.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.u16.byteSize);
        beet.u16.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.u16.read(buffer, offset);
        return [value, offset + beet.u16.byteSize];
      },
    };
  }

  get u32(): Serializer<number> {
    return {
      description: beet.u32.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.u32.byteSize);
        beet.u32.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.u32.read(buffer, offset);
        return [value, offset + beet.u32.byteSize];
      },
    };
  }

  get u64(): Serializer<number | bigint, bigint> {
    return {
      description: beet.u64.description,
      serialize: (value: number | bigint) => {
        const buffer = Buffer.alloc(beet.u64.byteSize);
        beet.u64.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const rawValue = beet.u64.read(buffer, offset);
        const value =
          typeof rawValue === 'number'
            ? BigInt(rawValue)
            : toBigInt(rawValue.toBuffer());
        return [value, offset + beet.u64.byteSize];
      },
    };
  }

  get u128(): Serializer<number | bigint, bigint> {
    throw new Error('Method not implemented.');
  }

  get i8(): Serializer<number> {
    throw new Error('Method not implemented.');
  }

  get i16(): Serializer<number> {
    throw new Error('Method not implemented.');
  }

  get i32(): Serializer<number> {
    throw new Error('Method not implemented.');
  }

  get i64(): Serializer<number | bigint, bigint> {
    throw new Error('Method not implemented.');
  }

  get i128(): Serializer<number | bigint, bigint> {
    throw new Error('Method not implemented.');
  }

  get f32(): Serializer<number> {
    throw new OperationNotSupportedError('f32');
  }

  get f64(): Serializer<number> {
    throw new OperationNotSupportedError('f64');
  }

  get string(): Serializer<string> {
    throw new Error('Method not implemented.');
  }

  get bytes(): Serializer<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  get publicKey(): Serializer<PublicKey | PublicKeyInput, PublicKey> {
    // beetSolana.publicKey;
    throw new Error('Method not implemented.');
  }
}
