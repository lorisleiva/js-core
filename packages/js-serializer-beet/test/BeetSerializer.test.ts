import { Serializer, bytesToHex, hexToBytes } from '@lorisleiva/js-core';
import {
  PublicKey as Web3PublicKey,
  Keypair as Web3Keypair,
} from '@solana/web3.js';
import test from 'ava';
import { BeetSerializer, OperationNotSupportedError } from '../src';

test('[js-serializer-beet] it can serialize booleans', (t) => {
  const { bool } = new BeetSerializer();
  t.is(bool.description, 'bool');
  t.is(s(bool, false), '00');
  t.is(s(bool, true), '01');
  t.is(d(bool, '00'), false);
  t.is(d(bool, '01'), true);
  t.is(d(bool, '0001', 0), false);
  t.is(d(bool, '0001', 1), true);
  t.is(sd(bool, false), false);
  t.is(sd(bool, true), true);
  t.is(doffset(bool, '01'), 1);
  t.is(doffset(bool, '0100'), 1);
  t.is(doffset(bool, '0100', 1), 2);
});

test('[js-serializer-beet] it can serialize u8 numbers', (t) => {
  const { u8 } = new BeetSerializer();
  t.is(u8.description, 'u8');
  t.is(s(u8, 0), '00');
  t.is(s(u8, 42), '2a');
  t.is(s(u8, 255), 'ff');
  t.is(d(u8, '2aff', 0), 42);
  t.is(d(u8, '2aff', 1), 255);
  t.is(sd(u8, 0), 0);
  t.is(sd(u8, 42), 42);
  t.is(sd(u8, 255), 255);
  t.throws<RangeError>(() => s(u8, -1));
  t.throws<RangeError>(() => s(u8, 256));
  t.is(doffset(u8, '01'), 1);
  t.is(doffset(u8, '0101'), 1);
});

test('[js-serializer-beet] it can serialize u16 numbers', (t) => {
  const { u16 } = new BeetSerializer();
  t.is(u16.description, 'u16');
  t.is(s(u16, 0), '0000');
  t.is(s(u16, 42), '2a00');
  t.is(s(u16, 255), 'ff00');
  t.is(s(u16, 256), '0001');
  t.is(s(u16, 65535), 'ffff');
  t.is(sd(u16, 0), 0);
  t.is(sd(u16, 42), 42);
  t.is(sd(u16, 65535), 65535);
  t.throws<RangeError>(() => s(u16, -1));
  t.throws<RangeError>(() => s(u16, 65536));
});

test('[js-serializer-beet] it can serialize u32 numbers', (t) => {
  const { u32 } = new BeetSerializer();
  const max = Number('0xffffffff');
  t.is(u32.description, 'u32');
  t.is(s(u32, 0), '00000000');
  t.is(s(u32, 42), '2a000000');
  t.is(s(u32, 65536), '00000100');
  t.is(s(u32, max), 'ffffffff');
  t.is(sd(u32, 0), 0);
  t.is(sd(u32, 42), 42);
  t.is(sd(u32, max), max);
  t.throws<RangeError>(() => s(u32, -1));
  t.throws<RangeError>(() => s(u32, 4_294_967_296));
});

test('[js-serializer-beet] it can serialize u64 numbers', (t) => {
  const { u64 } = new BeetSerializer();
  const max = BigInt('0xffffffffffffffff');
  t.is(u64.description, 'u64');
  t.is(s(u64, 0), '0000000000000000');
  t.is(s(u64, 42), '2a00000000000000');
  t.is(s(u64, 4_294_967_295), 'ffffffff00000000');
  t.is(s(u64, max), 'ffffffffffffffff');
  t.is(sd(u64, 0), 0n);
  t.is(sd(u64, 42), 42n);
  t.is(sd(u64, max), max);
  t.throws<RangeError>(() => s(u64, -1));
  t.throws<RangeError>(() => s(u64, max + 1n));
});

test('[js-serializer-beet] it can serialize u128 numbers', (t) => {
  const { u128 } = new BeetSerializer();
  const max = BigInt('0xffffffffffffffffffffffffffffffff');
  t.is(u128.description, 'u128');
  t.is(s(u128, 0), '00000000000000000000000000000000');
  t.is(s(u128, 42), '2a000000000000000000000000000000');
  t.is(s(u128, max), 'ffffffffffffffffffffffffffffffff');
  t.is(sd(u128, 0), 0n);
  t.is(sd(u128, 42), 42n);
  t.is(sd(u128, max), max);
  t.throws<RangeError>(() => s(u128, -1));
  t.throws<RangeError>(() => s(u128, max + 1n));
});

test('[js-serializer-beet] it can serialize i8 numbers', (t) => {
  const { i8 } = new BeetSerializer();
  t.is(i8.description, 'i8');
  t.is(s(i8, 0), '00');
  t.is(s(i8, -0), '00');
  t.is(s(i8, -42), 'd6');
  t.is(s(i8, 42), '2a');
  t.is(s(i8, 127), '7f');
  t.is(sd(i8, 0), 0);
  t.is(sd(i8, -128), -128);
  t.is(sd(i8, 127), 127);
  t.throws<RangeError>(() => s(i8, -129));
  t.throws<RangeError>(() => s(i8, 128));
});

test('[js-serializer-beet] it can serialize i16 numbers', (t) => {
  const { i16 } = new BeetSerializer();
  t.is(i16.description, 'i16');
  t.is(s(i16, 0), '0000');
  t.is(s(i16, -42), 'd6ff');
  t.is(s(i16, 42), '2a00');
  t.is(s(i16, 32767), 'ff7f');
  t.is(sd(i16, 0), 0);
  t.is(sd(i16, -32768), -32768);
  t.is(sd(i16, 32767), 32767);
  t.throws<RangeError>(() => s(i16, -32769));
  t.throws<RangeError>(() => s(i16, 32768));
});

test('[js-serializer-beet] it can serialize i32 numbers', (t) => {
  const { i32 } = new BeetSerializer();
  const max = Math.floor(Number('0xffffffff') / 2);
  t.is(i32.description, 'i32');
  t.is(s(i32, 0), '00000000');
  t.is(s(i32, -42), 'd6ffffff');
  t.is(s(i32, 42), '2a000000');
  t.is(s(i32, max), 'ffffff7f');
  t.is(sd(i32, 0), 0);
  t.is(sd(i32, -max - 1), -max - 1);
  t.is(sd(i32, max), max);
  t.throws<RangeError>(() => s(i32, -max - 2));
  t.throws<RangeError>(() => s(i32, max + 1));
});

test('[js-serializer-beet] it can serialize i64 numbers', (t) => {
  const { i64 } = new BeetSerializer();
  const max = BigInt('0xffffffffffffffff') / 2n;
  t.is(i64.description, 'i64');
  t.is(s(i64, 0), '0000000000000000');
  t.is(s(i64, -42), 'd6ffffffffffffff');
  t.is(s(i64, 42), '2a00000000000000');
  t.is(s(i64, max), 'ffffffffffffff7f');
  t.is(sd(i64, 0), 0n);
  t.is(sd(i64, -42), -42n);
  t.is(sd(i64, -max - 1n), -max - 1n);
  t.is(sd(i64, max), max);
  t.throws<RangeError>(() => s(i64, -max - 2n));
  t.throws<RangeError>(() => s(i64, max + 1n));
});

test('[js-serializer-beet] it can serialize i128 numbers', (t) => {
  const { i128 } = new BeetSerializer();
  const max = BigInt('0xffffffffffffffffffffffffffffffff') / 2n;
  t.is(i128.description, 'i128');
  t.is(s(i128, 0), '00000000000000000000000000000000');
  t.is(s(i128, -42), 'd6ffffffffffffffffffffffffffffff');
  t.is(s(i128, 42), '2a000000000000000000000000000000');
  t.is(s(i128, max), 'ffffffffffffffffffffffffffffff7f');
  t.is(sd(i128, 0), 0n);
  t.is(sd(i128, -42), -42n);
  t.is(sd(i128, -max - 1n), -max - 1n);
  t.is(sd(i128, max), max);
  t.throws<RangeError>(() => s(i128, -max - 2n));
  t.throws<RangeError>(() => s(i128, max + 1n));
});

test('[js-serializer-beet] it cannot serialize float numbers', (t) => {
  const { f32, f64 } = new BeetSerializer();
  const throwExpectation = { name: 'OperationNotSupportedError' };
  t.throws<OperationNotSupportedError>(() => s(f32, 1.5), throwExpectation);
  t.throws<OperationNotSupportedError>(() => d(f32, '00'), throwExpectation);
  t.throws<OperationNotSupportedError>(() => s(f64, 42.6), throwExpectation);
  t.throws<OperationNotSupportedError>(() => d(f64, '00'), throwExpectation);
});

test('[js-serializer-beet] it can serialize strings', (t) => {
  const { string, u32 } = new BeetSerializer();
  const getPrefix = (text: string) => d(u32, s(string, text).slice(0, 8));
  t.is(string.description, 'string');
  t.is(s(string, ''), '00000000'); // 4-bytes prefix.
  t.is(s(string, 'Hello World!'), '0c00000048656c6c6f20576f726c6421');
  t.is(getPrefix('Hello World!'), 12); // 12 bytes for 12 characters.
  t.is(s(string, '語'), '03000000e8aa9e');
  t.is(getPrefix('語'), 3); // 3 bytes for 1 character.
  t.is(sd(string, ''), '');
  t.is(sd(string, 'Hello World!'), 'Hello World!');
  t.is(sd(string, '語'), '語');
  t.is(doffset(string, '0c00000048656c6c6f20576f726c6421'), 4 + 12);
  t.is(doffset(string, '03000000e8aa9e'), 4 + 3);
});

test('[js-serializer-beet] it can serialize bytes', (t) => {
  const { bytes } = new BeetSerializer();
  t.is(bytes.description, 'bytes');
  t.is(s(bytes, new Uint8Array([0])), '00');
  t.is(s(bytes, new Uint8Array([42, 255])), '2aff');
  t.deepEqual(sd(bytes, new Uint8Array([42, 255])), new Uint8Array([42, 255]));
  t.is(doffset(bytes, '2aff00'), 3);
});

test('[js-serializer-beet] it can serialize public keys', (t) => {
  const { publicKey } = new BeetSerializer();
  t.is(publicKey.description, 'publicKey');
  const generatedPubKey = Web3Keypair.generate().publicKey;
  const pubKeyString = '4HM9LW2rm3SR2ZdBiFK3D21ENmQWpqEJEhx1nfgcC3r9';
  const pubKey = new Web3PublicKey(pubKeyString);
  const pubKeyHex = bytesToHex(pubKey.toBytes());
  t.is(s(publicKey, generatedPubKey), bytesToHex(generatedPubKey.toBytes()));
  t.is(s(publicKey, pubKeyString), pubKeyHex);
  t.is(s(publicKey, pubKey), pubKeyHex);
  t.deepEqual(sd(publicKey, pubKeyString), pubKey);
  t.deepEqual(sd(publicKey, pubKey), pubKey);
  t.deepEqual(sd(publicKey, generatedPubKey), generatedPubKey);
  const throwExpectation = { message: 'Invalid public key input' };
  t.throws(() => s(publicKey, ''), throwExpectation);
  t.throws(() => s(publicKey, 'x'), throwExpectation);
  t.throws(() => s(publicKey, 'x'.repeat(32)), throwExpectation);
  t.is(doffset(publicKey, pubKeyHex), 32);
});

test('[js-serializer-beet] it can serialize tuples', (t) => {
  const { tuple, u8, string, i16 } = new BeetSerializer();

  // Description matches the tuple definition.
  t.is(tuple([u8]).description, 'tuple(u8)');
  t.is(tuple([u8, string, i16]).description, 'tuple(u8, string, i16)');

  // Description can be overridden.
  t.is(tuple([u8], 'my tuple').description, 'my tuple');

  // Example with a single element.
  const single = tuple([u8]);
  t.is(s(single, [42]), '2a');
  t.deepEqual(sd(single, [1]), [1]);
  t.is(doffset(single, '2a'), 1);

  // Example with two numbers.
  const twoNumbers = tuple([u8, i16]);
  t.is(s(twoNumbers, [0, -42]), '00d6ff');
  t.deepEqual(sd(twoNumbers, [1, -2]), [1, -2]);
  t.is(doffset(twoNumbers, '00d6ff'), 3);

  // More examples.
  t.deepEqual(sd(tuple([]), []), []);
  t.deepEqual(sd(tuple([string, u8]), ['Hello', 42]), ['Hello', 42]);
  t.deepEqual(sd(tuple([string, string]), ['a', 'b']), ['a', 'b']);
  t.deepEqual(sd(tuple([u8, string, u8]), [1, '語', 2]), [1, '語', 2]);

  // Invalid input.
  t.throws(() => s(tuple([u8]), [] as any), {
    message: 'Expected tuple to have 1 items but got 0.',
  });
  t.throws(() => s(tuple([u8, string]), [1, 2, 'three'] as any), {
    message: 'Expected tuple to have 2 items but got 3.',
  });
});

test('[js-serializer-beet] it can serialize vectors', (t) => {
  const { vec, u8, string } = new BeetSerializer();

  // Description matches the vec definition.
  t.is(vec(u8).description, 'vec(u8)');
  t.is(vec(string).description, 'vec(string)');

  // Description can be overridden.
  t.is(vec(u8, 'my vec').description, 'my vec');

  // Example with numbers.
  const number = vec(u8);
  t.is(s(number, []), '00000000');
  t.is(s(number, [42]), '010000002a');
  t.is(s(number, [1, 2, 3]), '03000000010203');
  t.deepEqual(d(number, 'ff010000002a', 1), [42]);
  t.deepEqual(sd(number, [42]), [42]);
  t.deepEqual(sd(number, [1, 2, 3]), [1, 2, 3]);
  t.is(doffset(number, '010000002a'), 4 + 1);
  t.is(doffset(number, '03000000010203'), 4 + 3);

  // More examples.
  t.deepEqual(sd(vec(string), []), []);
  t.deepEqual(sd(vec(string), ['a', 'b', '語']), ['a', 'b', '語']);
});

test('[js-serializer-beet] it can serialize arrays', (t) => {
  const { array, u8, string } = new BeetSerializer();

  // Description matches the vec definition.
  t.is(array(u8, 5).description, 'array(u8; 5)');
  t.is(array(string, 1).description, 'array(string; 1)');

  // Description can be overridden.
  t.is(array(u8, 10, 'my array').description, 'my array');

  // Example with a single item.
  const single = array(u8, 1);
  t.is(s(single, [1]), '01');
  t.is(s(single, [42]), '2a');
  t.deepEqual(d(single, 'ff2a', 1), [42]);
  t.deepEqual(sd(single, [42]), [42]);
  t.is(doffset(single, '2a'), 1);
  t.is(doffset(single, 'ff2a', 1), 2);

  // More examples.
  t.deepEqual(sd(array(string, 0), []), []);
  t.deepEqual(sd(array(string, 1), ['Hello']), ['Hello']);
  t.deepEqual(sd(array(string, 3), ['a', 'b', '語']), ['a', 'b', '語']);
  t.deepEqual(sd(array(u8, 5), [1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);

  // Invalid input.
  t.throws(() => s(array(u8, 1), []), {
    message: 'Expected array to have 1 items but got 0.',
  });
  t.throws(() => s(array(string, 2), ['a', 'b', 'c']), {
    message: 'Expected array to have 2 items but got 3.',
  });
});

test('[js-serializer-beet] it can serialize maps', (t) => {
  const { map, u8, string } = new BeetSerializer();

  // Description matches the vec definition.
  t.is(map(u8, u8).description, 'map(u8, u8)');
  t.is(map(string, u8).description, 'map(string, u8)');

  // Description can be overridden.
  t.is(map(string, string, 'my map').description, 'my map');

  // Examples with numbers.
  const numberMap = map(u8, u8);
  t.is(s(numberMap, new Map()), '00000000');
  t.is(s(numberMap, new Map([[1, 2]])), '010000000102');
  t.deepEqual(d(numberMap, '010000000102'), new Map([[1, 2]]));
  t.deepEqual(sd(numberMap, new Map()), new Map());
  t.deepEqual(sd(numberMap, new Map([[1, 2]])), new Map([[1, 2]]));
  t.is(doffset(numberMap, '00000000'), 4);
  t.is(doffset(numberMap, '010000000102'), 4 + 2);
  t.is(doffset(numberMap, 'ff010000000102', 1), 1 + 4 + 2);

  // Example with strings and numbers.
  const letterMap = map(string, u8);
  t.is(s(letterMap, new Map()), '00000000');
  const letters = new Map([
    ['a', 1],
    ['b', 2],
  ]);
  t.is(
    s(letterMap, letters),
    '02000000' + // 2 items.
      '0100000061' + // String 'a'.
      '01' + // Number 1.
      '0100000062' + // String 'b'.
      '02' // Number 2.
  );
  t.deepEqual(d(letterMap, 'ff00000000', 1), new Map());
  t.deepEqual(sd(letterMap, new Map()), new Map());
  t.deepEqual(sd(letterMap, letters), letters);
  t.is(doffset(letterMap, '00000000'), 4);
});

/** Serialize as a hex string. */
function s<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: T extends T ? T : never
): string {
  return bytesToHex(serializer.serialize(value));
}

/** Deserialize from a hex string. */
function d<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: string,
  offset = 0
): T {
  const bytes = hexToBytes(value);
  return serializer.deserialize(bytes, offset)[0];
}

/** Deserialize from a hex string and get the new offset. */
function doffset<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: string,
  offset = 0
): number {
  const bytes = hexToBytes(value);
  return serializer.deserialize(bytes, offset)[1];
}

/** Serialize and deserialize. */
function sd<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: T extends T ? T : never
): U {
  return d(serializer, s(serializer, value)) as U;
}
