import { Serializer, bytesToHex, hexToBytes } from '@lorisleiva/js-core';
import test from 'ava';
import { BeetSerializer } from '../src';

test('[js-serializer-beet] it can serialize u8 numbers', (t) => {
  const { u8 } = new BeetSerializer();
  t.is(u8.description, 'u8');
  t.is(s(u8, 0), '00');
  t.is(s(u8, 42), '2a');
  t.is(s(u8, 255), 'ff');
  t.is(sd(u8, 0), 0);
  t.is(sd(u8, 42), 42);
  t.is(sd(u8, 255), 255);
  t.throws<RangeError>(() => s(u8, -1));
  t.throws<RangeError>(() => s(u8, 256));
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

/** Serialize as a hex string. */
function s<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: T extends T ? T : never
): string {
  return bytesToHex(serializer.serialize(value));
}

/** Deserialize from a hex string. */
function d<T, U extends T = T>(serializer: Serializer<T, U>, value: string): T {
  const bytes = hexToBytes(value);
  return serializer.deserialize(bytes)[0];
}

/** Serialize and deserialize. */
function sd<T, U extends T = T>(
  serializer: Serializer<T, U>,
  value: T extends T ? T : never
): U {
  return d(serializer, s(serializer, value)) as U;
}
