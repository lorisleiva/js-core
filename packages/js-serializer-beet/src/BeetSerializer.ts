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
          `"${variantKey}" should be a variant of the provided enum type, ` +
            `i.e. [${enumValues.join(', ')}]`
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

  dataEnum<T extends DataEnumUnion>(
    fields: DataEnumToSerializerTuple<T>,
    description?: string
  ): Serializer<T> {
    const fieldDescriptions = fields
      .map(([name, serializer]) => `${String(name)}: ${serializer.description}`)
      .join(', ');
    return {
      description: description ?? `dataEnum(${fieldDescriptions})`,
      serialize: (variant: T) => {
        const discriminator = fields.findIndex(
          ([key]) => variant.__kind === key
        );
        if (discriminator < 0) {
          throw new Error(
            `"${variant.__kind}" is not a variant of the provided data enum type, ` +
              `i.e. [${fields.map(([key]) => key).join(', ')}]`
          );
        }
        const variantPrefix = u8().serialize(discriminator);
        const variantSerializer = fields[discriminator][1];
        const variantBytes = variantSerializer
          ? variantSerializer.serialize(variant)
          : new Uint8Array();
        return mergeBytes([variantPrefix, variantBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [discriminator, dOffset] = u8().deserialize(bytes, offset);
        offset = dOffset;
        const variantField = fields[discriminator] ?? null;
        if (!variantField) {
          throw new Error(
            `Discriminator "${discriminator}" out of range for ${fields.length} variants.`
          );
        }
        const [variant, vOffset] = variantField[1]
          ? variantField[1].deserialize(bytes, offset)
          : [{}, offset];
        offset = vOffset;
        return [{ __kind: variantField[0], ...variant } as T, offset];
      },
    };
  }

  get bool(): Serializer<boolean> {
    return bool();
  }

  get u8(): Serializer<number> {
    return u8();
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

function bool(): Serializer<boolean> {
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

function u8(): Serializer<number> {
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
