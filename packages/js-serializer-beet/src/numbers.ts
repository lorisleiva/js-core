import type { Serializer } from '@lorisleiva/js-core';
import type { FixedSizeBeet } from '@metaplex-foundation/beet';
import * as beet from '@metaplex-foundation/beet';

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

export function bool(): Serializer<boolean> {
  return wrapBeet(beet.bool);
}

export function u8(): Serializer<number> {
  return wrapBeet(beet.u8);
}

export function u16(): Serializer<number> {
  return wrapBeet(beet.u16);
}

export function u32(): Serializer<number> {
  return wrapBeet(beet.u32);
}
