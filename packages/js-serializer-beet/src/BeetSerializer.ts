import {
  DataEnum,
  DataEnumToSerializerTuple,
  isSome,
  mergeBytes,
  none,
  Nullable,
  Option,
  PublicKey,
  PublicKeyInput,
  ScalarEnum,
  Serializer,
  SerializerInterface,
  some,
  StructToSerializerTuple,
  WrapInSerializer,
} from '@lorisleiva/js-core';
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKeyInput,
} from '@lorisleiva/js-web3js-adapters';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { PublicKey as Web3PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { OperationNotSupportedError } from './errors';
import {
  bool,
  i128,
  i16,
  i32,
  i64,
  i8,
  u128,
  u16,
  u32,
  u64,
  u8,
} from './numbers';

export class BeetSerializer implements SerializerInterface {
  tuple<T extends any[], U extends T>(
    items: WrapInSerializer<[...T], [...U]>,
    description?: string
  ): Serializer<T, U> {
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
        const values = [] as any as U;
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

  set<T>(
    itemSerializer: Serializer<T>,
    description?: string
  ): Serializer<Set<T>> {
    return {
      description: description ?? `set(${itemSerializer.description})`,
      serialize: (set: Set<T>) => {
        const lengthBytes = u32().serialize(set.size);
        const itemBytes = Array.from(set, (value) =>
          itemSerializer.serialize(value)
        );
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const set: Set<T> = new Set();
        const [length, newOffset] = u32().deserialize(bytes, offset);
        offset = newOffset;
        for (let i = 0; i < length; i += 1) {
          const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
          offset = newOffset;
          set.add(value);
        }
        return [set, offset];
      },
    };
  }

  option<T>(
    itemSerializer: Serializer<T>,
    description?: string
  ): Serializer<Option<T>> {
    return {
      description: description ?? `option(${itemSerializer.description})`,
      serialize: (option: Option<T>) => {
        const prefixByte = bool().serialize(isSome(option));
        const itemBytes = isSome(option)
          ? itemSerializer.serialize(option.value)
          : new Uint8Array();
        return mergeBytes([prefixByte, itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [isSome, prefixOffset] = bool().deserialize(bytes, offset);
        offset = prefixOffset;
        if (!isSome) {
          return [none(), offset];
        }
        const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
        offset = newOffset;
        return [some(value), offset];
      },
    };
  }

  nullable<T>(
    itemSerializer: Serializer<T>,
    description?: string
  ): Serializer<Nullable<T>> {
    return {
      description: description ?? `nullable(${itemSerializer.description})`,
      serialize: (option: Nullable<T>) => {
        const prefixByte = bool().serialize(option !== null);
        const itemBytes =
          option !== null ? itemSerializer.serialize(option) : new Uint8Array();
        return mergeBytes([prefixByte, itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [isSome, prefixOffset] = bool().deserialize(bytes, offset);
        offset = prefixOffset;
        if (!isSome) {
          return [null, offset];
        }
        const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
        offset = newOffset;
        return [value, offset];
      },
    };
  }

  struct<T extends object>(
    fields: StructToSerializerTuple<T>,
    description?: string
  ): Serializer<T> {
    const fieldDescriptions = fields
      .map(([name, serializer]) => `${String(name)}: ${serializer.description}`)
      .join(', ');
    return {
      description: description ?? `struct(${fieldDescriptions})`,
      serialize: (struct: T) => {
        const fieldBytes = fields.map(([key, serializer]) =>
          serializer.serialize(struct[key])
        );
        return mergeBytes(fieldBytes);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const struct: Partial<T> = {};
        fields.forEach(([key, serializer]) => {
          const [value, newOffset] = serializer.deserialize(bytes, offset);
          offset = newOffset;
          struct[key] = value;
        });
        return [struct as T, offset];
      },
    };
  }

  enum<T>(
    constructor: ScalarEnum<T> & {},
    description?: string
  ): Serializer<T> {
    const enumValues = Object.values(constructor);
    const isNumericEnum = enumValues.some((v) => typeof v === 'number');
    const valueDescriptions = enumValues
      .filter((v) => typeof v === 'string')
      .join(', ');
    function getVariantKeyValue(value: T): [keyof ScalarEnum<T>, number] {
      if (typeof value === 'number') {
        return [enumValues[value], value];
      }
      const variantValue = constructor[value as keyof ScalarEnum<T>];
      if (typeof variantValue === 'number') {
        return [value as keyof ScalarEnum<T>, variantValue];
      }
      const indexOfValue = enumValues.indexOf(variantValue);
      if (indexOfValue >= 0) {
        return [variantValue as keyof ScalarEnum<T>, indexOfValue];
      }
      return [value as keyof ScalarEnum<T>, enumValues.indexOf(value)];
    }
    function checkVariantExists(variantKey: keyof ScalarEnum<T>): void {
      if (!enumValues.includes(variantKey)) {
        throw new Error(
          `Invalid enum variant. Got "${variantKey}", expected one of ` +
            `[${enumValues.join(', ')}]`
        );
      }
    }
    return {
      description: description ?? `enum(${valueDescriptions})`,
      serialize: (value: T) => {
        const [variantKey, variantValue] = getVariantKeyValue(value);
        checkVariantExists(variantKey);
        return u8().serialize(variantValue);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [value, newOffset] = u8().deserialize(bytes, offset);
        offset = newOffset;
        const [variantKey, variantValue] = getVariantKeyValue(value as T);
        checkVariantExists(variantKey);
        return [(isNumericEnum ? variantValue : variantKey) as T, offset];
      },
    };
  }

  dataEnum<T extends DataEnum>(
    fields: DataEnumToSerializerTuple<T>,
    description?: string
  ): Serializer<T> {
    const fieldDescriptions = fields
      .map(
        ([name, serializer]) =>
          `${String(name)}${serializer ? `: ${serializer.description}` : ''}`
      )
      .join(', ');
    return {
      description: description ?? `dataEnum(${fieldDescriptions})`,
      serialize: (variant: T) => {
        const discriminator = fields.findIndex(
          ([key]) => variant.__kind === key
        );
        if (discriminator < 0) {
          throw new Error(
            `Invalid data enum variant. Got "${variant.__kind}", expected one of ` +
              `[${fields.map(([key]) => key).join(', ')}]`
          );
        }
        const variantPrefix = u8().serialize(discriminator);
        const variantSerializer = fields[discriminator][1];
        const variantBytes = variantSerializer.serialize(variant as any);
        return mergeBytes([variantPrefix, variantBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [discriminator, dOffset] = u8().deserialize(bytes, offset);
        offset = dOffset;
        const variantField = fields[discriminator] ?? null;
        if (!variantField) {
          throw new Error(
            `Data enum index "${discriminator}" is out of range. ` +
              `Index should be between 0 and ${fields.length - 1}.`
          );
        }
        const [variant, vOffset] = variantField[1].deserialize(bytes, offset);
        offset = vOffset;
        return [{ __kind: variantField[0], ...(variant ?? {}) } as T, offset];
      },
    };
  }

  get unit(): Serializer<void> {
    return {
      description: 'unit',
      serialize: () => new Uint8Array(),
      deserialize: (_bytes: Uint8Array, offset = 0) => [undefined, offset],
    };
  }

  get bool(): Serializer<boolean> {
    return bool();
  }

  get u8(): Serializer<number> {
    return u8();
  }

  get u16(): Serializer<number> {
    return u16();
  }

  get u32(): Serializer<number> {
    return u32();
  }

  get u64(): Serializer<number | bigint, bigint> {
    return u64();
  }

  get u128(): Serializer<number | bigint, bigint> {
    return u128();
  }

  get i8(): Serializer<number> {
    return i8();
  }

  get i16(): Serializer<number> {
    return i16();
  }

  get i32(): Serializer<number> {
    return i32();
  }

  get i64(): Serializer<number | bigint, bigint> {
    return i64();
  }

  get i128(): Serializer<number | bigint, bigint> {
    return i128();
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

  get publicKey(): Serializer<PublicKeyInput, PublicKey> {
    return {
      description: 'publicKey',
      serialize: (value: PublicKeyInput) => {
        const buffer = Buffer.alloc(beetSolana.publicKey.byteSize);
        const publicKey = new Web3PublicKey(toWeb3JsPublicKeyInput(value));
        beetSolana.publicKey.write(buffer, 0, publicKey);
        return new Uint8Array(buffer);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const buffer = Buffer.from(bytes);
        const value = beetSolana.publicKey.read(buffer, offset);
        return [
          fromWeb3JsPublicKey(value),
          offset + beetSolana.publicKey.byteSize,
        ];
      },
    };
  }
}
