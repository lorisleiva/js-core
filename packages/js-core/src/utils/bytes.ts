/* eslint-disable no-bitwise */
import { InvalidBaseStringError } from '../errors';
import { Serializer } from '../Serializer';

export const utf8: Serializer<string> = {
  description: 'utf8',
  fixedSize: null,
  serialize(value: string) {
    return new TextEncoder().encode(value);
  },
  deserialize(buffer, offset = 0) {
    const value = new TextDecoder().decode(buffer.slice(offset));
    return [value, buffer.length];
  },
};

export const base10: Serializer<string> = {
  description: 'base10',
  fixedSize: null,
  serialize(value: string) {
    if (!value.match(/^\d*$/)) {
      throw new InvalidBaseStringError(value, 10);
    }
    if (value === '') return new Uint8Array();
    const bytes = [];
    let integer = BigInt(value);
    do {
      bytes.unshift(Number(integer & 255n));
      integer >>= 8n;
    } while (integer > 0);
    return new Uint8Array(bytes);
  },
  deserialize(buffer, offset = 0) {
    if (buffer.length === 0) return ['', 0];
    const value = buffer
      .slice(offset)
      .reduce((acc, byte) => BigInt(acc) * 256n + BigInt(byte), 0n)
      .toString();
    return [value, buffer.length];
  },
};

const BASE_16_ALPHABET = '0123456789abcdef';
export const base16: Serializer<string> = {
  description: 'base16',
  fixedSize: null,
  serialize(value: string) {
    const lowercaseValue = value.toLowerCase();
    if (!lowercaseValue.match(new RegExp(`^[${BASE_16_ALPHABET}]*$`))) {
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

export const baseX = (alphabet: string): Serializer<string> => {
  const base = alphabet.length;
  const baseBigInt = BigInt(base);
  return {
    description: `base${base}`,
    fixedSize: null,
    serialize(value: string): Uint8Array {
      // Check if the value is valid.
      if (!value.match(new RegExp(`^[${alphabet}]*$`))) {
        throw new InvalidBaseStringError(value, base);
      }
      if (value === '') return new Uint8Array();

      // Handle leading zeroes.
      const chars = [...value];
      const trailIndex = chars.findIndex((c) => c !== alphabet[0]);
      const leadingZeroes = Array(trailIndex).fill(0);
      if (trailIndex === chars.length) return Uint8Array.from(leadingZeroes);

      // From baseX to base10.
      const tailChars = chars.slice(trailIndex);
      let base10Number = 0n;
      let baseXPower = 1n;
      for (let i = tailChars.length - 1; i >= 0; i -= 1) {
        const n = alphabet.indexOf(tailChars[i]);
        base10Number += baseXPower * BigInt(n);
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
      const trailIndex = bytes.findIndex((n) => n !== 0);
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

const BASE_58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const base58: Serializer<string> = baseX(BASE_58_ALPHABET);

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
