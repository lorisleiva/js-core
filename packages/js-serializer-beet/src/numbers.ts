import { Serializer } from '@lorisleiva/js-core';
import * as beet from '@metaplex-foundation/beet';

export function bool(): Serializer<boolean> {
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

export function u8(): Serializer<number> {
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

export function u32(): Serializer<number> {
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
