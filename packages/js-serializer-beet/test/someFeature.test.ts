import type { Serializer } from '@lorisleiva/js-core';
import test from 'ava';
import { BeetSerializer } from '../src';

test('[js-serializer-beet] it can serialize u8 number', async (t) => {
  const { u8 } = new BeetSerializer();
  t.deepEqual(u8.serialize(0), new Uint8Array([0]));
  t.deepEqual(u8.serialize(42), new Uint8Array([42]));
  t.deepEqual(u8.serialize(255), new Uint8Array([255]));
  t.is(wrapUnwrap(u8, 0), 0);
  t.is(wrapUnwrap(u8, 42), 42);
  t.throws<RangeError>(() => u8.serialize(-1));
  t.throws<RangeError>(() => u8.serialize(256));
});

test('[js-serializer-beet] it can serialize u16 number', async (t) => {
  const { u16 } = new BeetSerializer();
  t.deepEqual(u16.serialize(0), new Uint8Array([0, 0]));
  t.deepEqual(u16.serialize(42), new Uint8Array([42, 0]));
  t.deepEqual(u16.serialize(65535), new Uint8Array([255, 255]));
  t.is(wrapUnwrap(u16, 0), 0);
  t.is(wrapUnwrap(u16, 42), 42);
  t.throws<RangeError>(() => u16.serialize(-1));
  t.throws<RangeError>(() => u16.serialize(65536));
});

function wrapUnwrap<T>(serializer: Serializer<T>, value: T) {
  return serializer.deserialize(serializer.serialize(value))[0];
}
