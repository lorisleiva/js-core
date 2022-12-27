import type { Serializer } from '@lorisleiva/js-core';
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
  t.is(s(u16, 256), 'ff01');
  t.is(s(u16, 65535), 'ffff');
  t.is(sd(u16, 0), 0);
  t.is(sd(u16, 42), 42);
  t.is(sd(u16, 65535), 65535);
  t.throws<RangeError>(() => s(u16, -1));
  t.throws<RangeError>(() => s(u16, 65536));
});

test('[js-serializer-beet] it can serialize u32 numbers', (t) => {
  const { u32 } = new BeetSerializer();
  t.is(u32.description, 'u32');
  t.is(s(u32, 0), '00000000');
  t.is(s(u32, 42), '2a000000');
  t.is(s(u32, 65536), 'ffff0100');
  t.is(sd(u32, 0), 0);
  t.is(sd(u32, 42), 42);
  t.is(sd(u32, 4_294_967_295), 4_294_967_295);
  t.throws<RangeError>(() => s(u32, -1));
  t.throws<RangeError>(() => s(u32, 4_294_967_296));
});

function s<T>(serializer: Serializer<T>, value: T): string {
  return toHexString(serializer.serialize(value));
}

function d<T>(serializer: Serializer<T>, value: string): T {
  const bytes = fromHexString(value);
  return serializer.deserialize(bytes)[0];
}

function sd<T>(serializer: Serializer<T>, value: T) {
  return d(serializer, s(serializer, value));
}

function fromHexString(value: string): Uint8Array {
  const matches = value.match(/.{1,2}/g);
  return Uint8Array.from(
    matches ? matches.map((byte: string) => parseInt(byte, 16)) : []
  );
}

function toHexString(bytes: Uint8Array): string {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    ''
  );
}
