/* eslint-disable no-bitwise */
import { InvalidBaseStringError } from '../errors/InvalidBaseStringError';
import type { Serializer } from '../Serializer';
import { removeNullCharacters } from './nullCharacters';

export const utf8: Serializer<string> = {
  description: 'utf8',
  fixedSize: null,
  maxSize: null,
  serialize(value: string) {
    return new TextEncoder().encode(value);
  },
  deserialize(buffer, offset = 0) {
    const value = new TextDecoder().decode(buffer.slice(offset));
    return [removeNullCharacters(value), buffer.length];
  },
};

export const baseX = (alphabet: string): Serializer<string> => {
  const base = alphabet.length;
  const baseBigInt = BigInt(base);
  return {
    description: `base${base}`,
    fixedSize: null,
    maxSize: null,
    serialize(value: string): Uint8Array {
      // Check if the value is valid.
      if (!value.match(new RegExp(`^[${alphabet}]*$`))) {
        throw new InvalidBaseStringError(value, base);
      }
      if (value === '') return new Uint8Array();

      // Handle leading zeroes.
      const chars = [...value];
      let trailIndex = chars.findIndex((c) => c !== alphabet[0]);
      trailIndex = trailIndex === -1 ? chars.length : trailIndex;
      const leadingZeroes = Array(trailIndex).fill(0);
      if (trailIndex === chars.length) return Uint8Array.from(leadingZeroes);

      // From baseX to base10.
      const tailChars = chars.slice(trailIndex);
      let base10Number = 0n;
      let baseXPower = 1n;
      for (let i = tailChars.length - 1; i >= 0; i -= 1) {
        base10Number += baseXPower * BigInt(alphabet.indexOf(tailChars[i]));
        baseXPower *= baseBigInt;
      }

      // From base10 to bytes.
      const tailBytes = [];
      while (base10Number > 0n) {
        tailBytes.unshift(Number(base10Number % 256n));
        base10Number /= 256n;
      }
      return Uint8Array.from(leadingZeroes.concat(tailBytes));
    },
    deserialize(buffer, offset = 0): [string, number] {
      if (buffer.length === 0) return ['', 0];

      // Handle leading zeroes.
      const bytes = buffer.slice(offset);
      let trailIndex = bytes.findIndex((n) => n !== 0);
      trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
      const leadingZeroes = alphabet[0].repeat(trailIndex);
      if (trailIndex === bytes.length) return [leadingZeroes, buffer.length];

      // From bytes to base10.
      let base10Number = bytes
        .slice(trailIndex)
        .reduce((sum, byte) => sum * 256n + BigInt(byte), 0n);

      // From base10 to baseX.
      const tailChars = [];
      while (base10Number > 0n) {
        tailChars.unshift(alphabet[Number(base10Number % baseBigInt)]);
        base10Number /= baseBigInt;
      }

      return [leadingZeroes + tailChars.join(''), buffer.length];
    },
  };
};

export const base10: Serializer<string> = baseX('0123456789');
export const base58: Serializer<string> = baseX(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
);
export const base64: Serializer<string> = baseX(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
);

export const base16: Serializer<string> = {
  description: 'base16',
  fixedSize: null,
  maxSize: null,
  serialize(value: string) {
    const lowercaseValue = value.toLowerCase();
    if (!lowercaseValue.match(/^[0123456789abcdef]*$/)) {
      throw new InvalidBaseStringError(value, 16);
    }
    const matches = lowercaseValue.match(/.{1,2}/g);
    return Uint8Array.from(
      matches ? matches.map((byte: string) => parseInt(byte, 16)) : []
    );
  },
  deserialize(buffer, offset = 0) {
    const value = buffer
      .slice(offset)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    return [value, buffer.length];
  },
};

export const mergeBytes = (bytesArr: Uint8Array[]): Uint8Array => {
  const totalLength = bytesArr.reduce((total, arr) => total + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  bytesArr.forEach((arr) => {
    result.set(arr, offset);
    offset += arr.length;
  });
  return result;
};
