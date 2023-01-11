/* eslint-disable no-bitwise */
import { InvalidBaseStringError } from '../errors';
import { mapSerializer, Serializer } from '../Serializer';

export const base10: Serializer<string> = {
  description: 'base10',
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

const BASE_58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const base58: Serializer<string> = {
  ...mapSerializer(
    base10,
    (base58) => {
      if (!base58.match(new RegExp(`^[${BASE_58_ALPHABET}]*$`))) {
        throw new InvalidBaseStringError(base58, 58);
      }
      if (base58 === '') return '';
      const chars = base58.split('').reverse();
      const base10 = chars.reduce(
        (acc, char, i) =>
          acc + BigInt(BASE_58_ALPHABET.indexOf(char)) * 58n ** BigInt(i),
        0n
      );
      return base10.toString();
    },
    (base10) => {
      const characters: string[] = [];
      if (base10 === '') return '';
      let integer = BigInt(base10);
      do {
        characters.unshift(BASE_58_ALPHABET[Number(integer % 58n)]);
        integer /= 58n;
      } while (integer > 0);
      return characters.join('');
    }
  ),
  description: 'base58',
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
