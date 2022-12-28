import { Serializer, toBigInt } from '@lorisleiva/js-core';
import type { FixedSizeBeet } from '@metaplex-foundation/beet';
import * as beet from '@metaplex-foundation/beet';

export const bool = () => wrapBeet(beet.bool);
export const u8 = () => wrapBeet(beet.u8);
export const u16 = () => wrapBeet(beet.u16);
export const u32 = () => wrapBeet(beet.u32);
export const i8 = () => wrapBeet(beet.i8);
export const i16 = () => wrapBeet(beet.i16);
export const i32 = () => wrapBeet(beet.i32);

export const u64 = () => {
  const serializer = wrapBigintBeet(beet.u64);
  return {
    ...serializer,
    serialize: (value: number | bigint) => {
      if (value < 0) throw new RangeError('u64 cannot be negative');
      return serializer.serialize(value);
    },
  };
};
export const u128 = () => {
  const serializer = wrapBigintBeet(beet.u128);
  return {
    ...serializer,
    serialize: (value: number | bigint) => {
      if (value < 0) throw new RangeError('u128 cannot be negative');
      return serializer.serialize(value);
    },
  };
};

function wrapBeet<T>(fixedBeet: FixedSizeBeet<T>): Serializer<T> {
  return {
    description: fixedBeet.description,
    serialize: (value: T) => {
      const buffer = Buffer.alloc(fixedBeet.byteSize);
      fixedBeet.write(buffer, 0, value);
      return new Uint8Array(buffer);
    },
    deserialize: (bytes: Uint8Array, offset = 0) => {
      const buffer = Buffer.from(bytes);
      const value = fixedBeet.read(buffer, offset);
      return [value, offset + fixedBeet.byteSize];
    },
  };
}

function wrapBigintBeet(
  fixedBeet: FixedSizeBeet<beet.bignum>
): Serializer<number | bigint, bigint> {
  return {
    description: fixedBeet.description,
    serialize: (value: number | bigint) => {
      const buffer = Buffer.alloc(fixedBeet.byteSize);
      fixedBeet.write(buffer, 0, value);
      return new Uint8Array(buffer);
    },
    deserialize: (bytes: Uint8Array, offset = 0) => {
      const buffer = Buffer.from(bytes);
      const rawValue = fixedBeet.read(buffer, offset);
      const value =
        typeof rawValue === 'number'
          ? BigInt(rawValue)
          : toBigInt(rawValue.toString());
      return [value, offset + fixedBeet.byteSize];
    },
  };
}
