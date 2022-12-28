/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DataEnumToSerializerTuple,
  DataEnumUnion,
  mergeBytes,
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
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { PublicKey as Web3PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { OperationNotSupportedError } from './errors';

export class BeetSerializer implements SerializerInterface {
  tuple<T extends any[]>(
    items: [...WrapInSerializer<T>],
    description?: string
  ): Serializer<T> {
    const itemDescriptions = items.map((item) => item.description).join(', ');
    return {
      description: description ?? `tuple(${itemDescriptions})`,
      serialize: (value: T) => {
        if (value.length !== items.length) {
          throw new Error(
            `Expected tuple to have ${items.length} items but got ${value.length}.`
          );
        }
        return mergeBytes(
          items.map((item, index) => item.serialize(value[index]))
        );
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const values = [] as any as T;
        items.forEach((serializer) => {
          const [newValue, newOffset] = serializer.deserialize(bytes, offset);
          values.push(newValue);
          offset = newOffset;
        });
        return [values, offset];
      },
    };
  }

  vec<T>(itemSerializer: Serializer<T>, description?: string): Serializer<T[]> {
    return {
      description: description ?? `vec(${itemSerializer.description})`,
      serialize: (value: T[]) => {
        const lengthBytes = u32().serialize(value.length);
        const itemBytes = value.map((item) => itemSerializer.serialize(item));
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const values: T[] = [];
        const [length, newOffset] = u32().deserialize(bytes, offset);
        offset = newOffset;
        for (let i = 0; i < length; i += 1) {
          const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
          values.push(value);
          offset = newOffset;
        }
        return [values, offset];
      },
    };
  }

  array<T>(
    itemSerializer: Serializer<T>,
    size: number,
    description?: string
  ): Serializer<T[]> {
    return {
      description:
        description ?? `array(${itemSerializer.description}; ${size})`,
      serialize: (value: T[]) => {
        if (value.length !== size) {
          throw new Error(
            `Expected array to have ${size} items but got ${value.length}.`
          );
        }
        return mergeBytes(value.map((item) => itemSerializer.serialize(item)));
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const values: T[] = [];
        for (let i = 0; i < size; i += 1) {
          const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
          values.push(value);
          offset = newOffset;
        }
        return [values, offset];
      },
    };
  }

  map<K, V>(
    keySerializer: Serializer<K>,
    valueSerializer: Serializer<V>,
    description?: string
  ): Serializer<Map<K, V>> {
    return {
      description:
        description ??
        `map(${keySerializer.description}, ${valueSerializer.description})`,
      serialize: (map: Map<K, V>) => {
        const lengthBytes = u32().serialize(map.size);
        const itemBytes = Array.from(map, ([key, value]) =>
          mergeBytes([
            keySerializer.serialize(key),
            valueSerializer.serialize(value),
          ])
        );
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const map: Map<K, V> = new Map();
        const [length, newOffset] = u32().deserialize(bytes, offset);
        offset = newOffset;
        for (let i = 0; i < length; i += 1) {
          const [key, kOffset] = keySerializer.deserialize(bytes, offset);
          offset = kOffset;
          const [value, vOffset] = valueSerializer.deserialize(bytes, offset);
          offset = vOffset;
          map.set(key, value);
        }
        return [map, offset];
      },
    };
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
    return {
      description: beet.bool.description,
      serialize: (value: boolean) => {
        const buffer = Buffer.alloc(beet.u8.byteSize);
        beet.bool.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.bool.read(buffer, offset);
        return [value, offset + beet.bool.byteSize];
      },
    };
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
    return u32();
  }

  get u64(): Serializer<number | bigint, bigint> {
    return {
      description: beet.u64.description,
      serialize: (value: number | bigint) => {
        if (value < 0) throw new RangeError('u64 cannot be negative');
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
            : toBigInt(rawValue.toString());
        return [value, offset + beet.u64.byteSize];
      },
    };
  }

  get u128(): Serializer<number | bigint, bigint> {
    return {
      description: beet.u128.description,
      serialize: (value: number | bigint) => {
        if (value < 0) throw new RangeError('u128 cannot be negative');
        const buffer = Buffer.alloc(beet.u128.byteSize);
        beet.u128.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const rawValue = beet.u128.read(buffer, offset);
        const value =
          typeof rawValue === 'number'
            ? BigInt(rawValue)
            : toBigInt(rawValue.toString());
        return [value, offset + beet.u128.byteSize];
      },
    };
  }

  get i8(): Serializer<number> {
    return {
      description: beet.i8.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.i8.byteSize);
        beet.i8.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.i8.read(buffer, offset);
        return [value, offset + beet.i8.byteSize];
      },
    };
  }

  get i16(): Serializer<number> {
    return {
      description: beet.i16.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.i16.byteSize);
        beet.i16.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.i16.read(buffer, offset);
        return [value, offset + beet.i16.byteSize];
      },
    };
  }

  get i32(): Serializer<number> {
    return {
      description: beet.i32.description,
      serialize: (value: number) => {
        const buffer = Buffer.alloc(beet.i32.byteSize);
        beet.i32.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beet.i32.read(buffer, offset);
        return [value, offset + beet.i32.byteSize];
      },
    };
  }

  get i64(): Serializer<number | bigint, bigint> {
    return {
      description: beet.i64.description,
      serialize: (value: number | bigint) => {
        if (value < (-2n) ** 63n) {
          throw new RangeError('i64 cannot be lower than -2^63');
        }
        if (value > 2n ** 63n - 1n) {
          throw new RangeError('i64 cannot be greater than 2^63 - 1');
        }
        const buffer = Buffer.alloc(beet.i64.byteSize);
        beet.i64.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const rawValue = beet.i64.read(buffer, offset);
        const value =
          typeof rawValue === 'number'
            ? BigInt(rawValue)
            : toBigInt(rawValue.toString());
        return [value, offset + beet.i64.byteSize];
      },
    };
  }

  get i128(): Serializer<number | bigint, bigint> {
    return {
      description: beet.i128.description,
      serialize: (value: number | bigint) => {
        if (value < (-2n) ** 127n) {
          throw new RangeError('i128 cannot be lower than -2^127');
        }
        if (value > 2n ** 127n - 1n) {
          throw new RangeError('i128 cannot be greater than 2^127 - 1');
        }
        const buffer = Buffer.alloc(beet.i128.byteSize);
        beet.i128.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const rawValue = beet.i128.read(buffer, offset);
        const value =
          typeof rawValue === 'number'
            ? BigInt(rawValue)
            : toBigInt(rawValue.toString());
        return [value, offset + beet.i128.byteSize];
      },
    };
  }

  get f32(): Serializer<number> {
    return {
      description: 'f32 [not supported]',
      serialize: () => {
        throw new OperationNotSupportedError('f32');
      },
      deserialize: () => {
        throw new OperationNotSupportedError('f32');
      },
    };
  }

  get f64(): Serializer<number> {
    return {
      description: 'f64 [not supported]',
      serialize: () => {
        throw new OperationNotSupportedError('f64');
      },
      deserialize: () => {
        throw new OperationNotSupportedError('f64');
      },
    };
  }

  get string(): Serializer<string> {
    return {
      description: 'string',
      serialize: (value: string) => {
        const stringBeet = beet.utf8String.toFixedFromValue(value);
        const buffer = Buffer.alloc(stringBeet.byteSize);
        stringBeet.write(buffer, 0, value);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const stringBeet = beet.utf8String.toFixedFromData(buffer, offset);
        const value = stringBeet.read(buffer, offset);
        return [value, offset + stringBeet.byteSize];
      },
    };
  }

  get bytes(): Serializer<Uint8Array> {
    return {
      description: 'bytes',
      serialize: (value: Uint8Array) => new Uint8Array(value),
      deserialize: (bytes: Uint8Array, offset = 0) => [
        new Uint8Array(bytes),
        offset + bytes.length,
      ],
    };
  }

  get publicKey(): Serializer<PublicKey | PublicKeyInput, PublicKey> {
    return {
      description: 'publicKey',
      serialize: (value: PublicKey | PublicKeyInput) => {
        const buffer = Buffer.alloc(beetSolana.publicKey.byteSize);
        beetSolana.publicKey.write(buffer, 0, new Web3PublicKey(value));
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beetSolana.publicKey.read(buffer, offset);
        return [value, offset + beetSolana.publicKey.byteSize];
      },
    };
  }
}

function u32(): Serializer<number> {
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
