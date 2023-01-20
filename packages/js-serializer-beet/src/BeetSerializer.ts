import {
  DataEnum,
  DataEnumToSerializerTuple,
  isSome,
  mergeBytes,
  none,
  Nullable,
  NumberSerializer,
  Option,
  publicKey,
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
  toWeb3JsPublicKey,
} from '@lorisleiva/js-web3js-adapters';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
import { PublicKey as Web3PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { OperationNotSupportedError } from './errors';
import { i128, i16, i32, i64, i8, u128, u16, u32, u64, u8 } from './numbers';

export class BeetSerializer implements SerializerInterface {
  tuple<T extends any[], U extends T = T>(
    items: WrapInSerializer<[...T], [...U]>,
    description?: string
  ): Serializer<T, U> {
    const itemDescriptions = items.map((item) => item.description).join(', ');
    return {
      description: description ?? `tuple(${itemDescriptions})`,
      fixedSize: sumSerializerSizes(items.map((item) => item.fixedSize)),
      maxSize: sumSerializerSizes(items.map((item) => item.maxSize)),
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

  vec<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<T[], U[]> {
    const prefixSeralizer = prefix ?? u32();
    return {
      description: description ?? `vec(${itemSerializer.description})`,
      fixedSize: null,
      maxSize: null,
      serialize: (value: T[]) => {
        const lengthBytes = prefixSeralizer.serialize(value.length);
        const itemBytes = value.map((item) => itemSerializer.serialize(item));
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const values: U[] = [];
        const [length, newOffset] = prefixSeralizer.deserialize(bytes, offset);
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

  array<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    size: number,
    description?: string
  ): Serializer<T[], U[]> {
    function getSize(childSize: number | null): number | null {
      if (size === 0) return 0;
      return childSize === null ? null : childSize * size;
    }
    return {
      description:
        description ?? `array(${itemSerializer.description}; ${size})`,
      fixedSize: getSize(itemSerializer.fixedSize),
      maxSize: getSize(itemSerializer.maxSize),
      serialize: (value: T[]) => {
        if (value.length !== size) {
          throw new Error(
            `Expected array to have ${size} items but got ${value.length}.`
          );
        }
        return mergeBytes(value.map((item) => itemSerializer.serialize(item)));
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const values: U[] = [];
        for (let i = 0; i < size; i += 1) {
          const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
          values.push(value);
          offset = newOffset;
        }
        return [values, offset];
      },
    };
  }

  map<TK, TV, UK extends TK = TK, UV extends TV = TV>(
    keySerializer: Serializer<TK, UK>,
    valueSerializer: Serializer<TV, UV>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<Map<TK, TV>, Map<UK, UV>> {
    const prefixSeralizer = prefix ?? u32();
    return {
      description:
        description ??
        `map(${keySerializer.description}, ${valueSerializer.description})`,
      fixedSize: null,
      maxSize: null,
      serialize: (map: Map<TK, TV>) => {
        const lengthBytes = prefixSeralizer.serialize(map.size);
        const itemBytes = Array.from(map, ([key, value]) =>
          mergeBytes([
            keySerializer.serialize(key),
            valueSerializer.serialize(value),
          ])
        );
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const map: Map<UK, UV> = new Map();
        const [length, newOffset] = prefixSeralizer.deserialize(bytes, offset);
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

  set<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<Set<T>, Set<U>> {
    const prefixSeralizer = prefix ?? u32();
    return {
      description: description ?? `set(${itemSerializer.description})`,
      fixedSize: null,
      maxSize: null,
      serialize: (set: Set<T>) => {
        const lengthBytes = prefixSeralizer.serialize(set.size);
        const itemBytes = Array.from(set, (value) =>
          itemSerializer.serialize(value)
        );
        return mergeBytes([lengthBytes, ...itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const set: Set<U> = new Set();
        const [length, newOffset] = prefixSeralizer.deserialize(bytes, offset);
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

  option<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<Option<T>, Option<U>> {
    const prefixSeralizer = prefix ?? u8();
    return {
      description: description ?? `option(${itemSerializer.description})`,
      fixedSize:
        itemSerializer.fixedSize === 0 ? prefixSeralizer.maxSize : null,
      maxSize: sumSerializerSizes([
        prefixSeralizer.maxSize,
        itemSerializer.maxSize,
      ]),
      serialize: (option: Option<T>) => {
        const prefixByte = prefixSeralizer.serialize(Number(isSome(option)));
        const itemBytes = isSome(option)
          ? itemSerializer.serialize(option.value)
          : new Uint8Array();
        return mergeBytes([prefixByte, itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [isSome, prefixOffset] = prefixSeralizer.deserialize(
          bytes,
          offset
        );
        offset = prefixOffset;
        if (isSome === 0) {
          return [none(), offset];
        }
        const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
        offset = newOffset;
        return [some(value), offset];
      },
    };
  }

  fixedOption<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<Option<T>, Option<U>> {
    const prefixSeralizer = prefix ?? u8();
    if (
      itemSerializer.fixedSize === null ||
      prefixSeralizer.fixedSize === null
    ) {
      throw new Error(
        'fixedOption can only be used with fixed size serializers'
      );
    }
    return {
      description: description ?? `fixedOption(${itemSerializer.description})`,
      fixedSize: prefixSeralizer.fixedSize + itemSerializer.fixedSize,
      maxSize: prefixSeralizer.fixedSize + itemSerializer.fixedSize,
      serialize: (option: Option<T>) => {
        const fixedSize = itemSerializer.fixedSize as number;
        const prefixByte = prefixSeralizer.serialize(Number(isSome(option)));
        const itemBytes = isSome(option)
          ? itemSerializer.serialize(option.value).slice(0, fixedSize)
          : new Uint8Array(Array(fixedSize).fill(0));
        return mergeBytes([prefixByte, itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [isSome] = prefixSeralizer.deserialize(bytes, offset);
        offset += prefixSeralizer.fixedSize as number;
        const newOffset = offset + (itemSerializer.fixedSize as number);
        if (isSome === 0) {
          return [none(), newOffset];
        }
        const [value] = itemSerializer.deserialize(bytes, offset);
        return [some(value), newOffset];
      },
    };
  }

  nullable<T, U extends T = T>(
    itemSerializer: Serializer<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<Nullable<T>, Nullable<U>> {
    const prefixSeralizer = prefix ?? u8();
    return {
      description: description ?? `nullable(${itemSerializer.description})`,
      fixedSize:
        itemSerializer.fixedSize === 0 ? prefixSeralizer.maxSize : null,
      maxSize: sumSerializerSizes([
        prefixSeralizer.maxSize,
        itemSerializer.maxSize,
      ]),
      serialize: (option: Nullable<T>) => {
        const prefixByte = prefixSeralizer.serialize(Number(option !== null));
        const itemBytes =
          option !== null ? itemSerializer.serialize(option) : new Uint8Array();
        return mergeBytes([prefixByte, itemBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [isSome, prefixOffset] = prefixSeralizer.deserialize(
          bytes,
          offset
        );
        offset = prefixOffset;
        if (isSome === 0) {
          return [null, offset];
        }
        const [value, newOffset] = itemSerializer.deserialize(bytes, offset);
        offset = newOffset;
        return [value, offset];
      },
    };
  }

  struct<T extends object, U extends T = T>(
    fields: StructToSerializerTuple<T, U>,
    description?: string
  ): Serializer<T, U> {
    const fieldDescriptions = fields
      .map(([name, serializer]) => `${String(name)}: ${serializer.description}`)
      .join(', ');
    return {
      description: description ?? `struct(${fieldDescriptions})`,
      fixedSize: sumSerializerSizes(fields.map(([, field]) => field.fixedSize)),
      maxSize: sumSerializerSizes(fields.map(([, field]) => field.maxSize)),
      serialize: (struct: T) => {
        const fieldBytes = fields.map(([key, serializer]) =>
          serializer.serialize(struct[key])
        );
        return mergeBytes(fieldBytes);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const struct: Partial<U> = {};
        fields.forEach(([key, serializer]) => {
          const [value, newOffset] = serializer.deserialize(bytes, offset);
          offset = newOffset;
          struct[key] = value;
        });
        return [struct as U, offset];
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
      fixedSize: 1,
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

  dataEnum<T extends DataEnum, U extends T = T>(
    fields: DataEnumToSerializerTuple<T, U>,
    prefix?: NumberSerializer,
    description?: string
  ): Serializer<T, U> {
    const prefixSeralizer = prefix ?? u8();
    const fieldDescriptions = fields
      .map(
        ([name, serializer]) =>
          `${String(name)}${serializer ? `: ${serializer.description}` : ''}`
      )
      .join(', ');
    const allVariantHaveTheSameFixedSize = fields.every(
      (one, i, all) => one[1].fixedSize === all[0][1].fixedSize
    );
    return {
      description: description ?? `dataEnum(${fieldDescriptions})`,
      fixedSize:
        allVariantHaveTheSameFixedSize &&
        fields.length > 0 &&
        fields[0][1].fixedSize !== null &&
        prefixSeralizer.fixedSize !== null
          ? fields[0][1].fixedSize + prefixSeralizer.fixedSize
          : null,
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
        const variantPrefix = prefixSeralizer.serialize(discriminator);
        const variantSerializer = fields[discriminator][1];
        const variantBytes = variantSerializer.serialize(variant as any);
        return mergeBytes([variantPrefix, variantBytes]);
      },
      deserialize: (bytes: Uint8Array, offset = 0) => {
        const [discriminator, dOffset] = prefixSeralizer.deserialize(
          bytes,
          offset
        );
        offset = dOffset;
        const variantField = fields[Number(discriminator)] ?? null;
        if (!variantField) {
          throw new Error(
            `Data enum index "${discriminator}" is out of range. ` +
              `Index should be between 0 and ${fields.length - 1}.`
          );
        }
        const [variant, vOffset] = variantField[1].deserialize(bytes, offset);
        offset = vOffset;
        return [{ __kind: variantField[0], ...(variant ?? {}) } as U, offset];
      },
    };
  }

  get unit(): Serializer<void> {
    return {
      description: 'unit',
      fixedSize: 0,
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
      fixedSize: 4,
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
      fixedSize: 8,
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
      fixedSize: null,
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
      fixedSize: null,
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
      fixedSize: 32,
      serialize: (value: PublicKeyInput) => {
        const buffer = Buffer.alloc(beetSolana.publicKey.byteSize);
        const key = new Web3PublicKey(toWeb3JsPublicKey(publicKey(value)));
        beetSolana.publicKey.write(buffer, 0, key);
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

function sumSerializerSizes(sizes: (number | null)[]): number | null {
  return sizes.reduce(
    (all, size) => (all === null || size === null ? null : all + size),
    0 as number | null
  );
}
