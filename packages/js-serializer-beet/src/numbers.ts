import type { Serializer } from '@lorisleiva/js-core';
import type { FixedSizeBeet } from '@metaplex-foundation/beet';
import * as beet from '@metaplex-foundation/beet';

export const bool = (): Serializer<boolean> => wrapBeet(beet.bool);
export const u8 = (): Serializer<number> => wrapBeet(beet.u8);
export const u16 = (): Serializer<number> => wrapBeet(beet.u16);
export const u32 = (): Serializer<number> => wrapBeet(beet.u32);
export const i8 = (): Serializer<number> => wrapBeet(beet.i8);
export const i16 = (): Serializer<number> => wrapBeet(beet.i16);
export const i32 = (): Serializer<number> => wrapBeet(beet.i32);

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
