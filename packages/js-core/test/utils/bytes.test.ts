import test from 'ava';
import { base10, base16, base58, utf8 } from '../../src';

test('it can serialize utf8 strings', (t) => {
  t.deepEqual(utf8.serialize(''), new Uint8Array([]));
  t.deepEqual(utf8.deserialize(new Uint8Array([])), ['', 0]);

  t.deepEqual(utf8.serialize('0'), new Uint8Array([48]));
  t.deepEqual(utf8.deserialize(new Uint8Array([48])), ['0', 1]);

  t.deepEqual(utf8.serialize('ABC'), new Uint8Array([65, 66, 67]));
  t.deepEqual(utf8.deserialize(new Uint8Array([65, 66, 67])), ['ABC', 3]);

  const serializedHelloWorld = new Uint8Array([
    72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
  ]);
  t.deepEqual(utf8.serialize('Hello World!'), serializedHelloWorld);
  t.deepEqual(utf8.deserialize(serializedHelloWorld), ['Hello World!', 12]);

  t.deepEqual(utf8.serialize('語'), new Uint8Array([232, 170, 158]));
  t.deepEqual(utf8.deserialize(new Uint8Array([232, 170, 158])), ['語', 3]);
});

test('it can serialize base 10 strings', (t) => {
  t.deepEqual(base10.serialize(''), new Uint8Array([]));
  t.deepEqual(base10.deserialize(new Uint8Array([])), ['', 0]);

  t.deepEqual(base10.serialize('0'), new Uint8Array([0]));
  t.deepEqual(base10.deserialize(new Uint8Array([0])), ['0', 1]);

  t.deepEqual(base10.serialize('1'), new Uint8Array([1]));
  t.deepEqual(base10.deserialize(new Uint8Array([1])), ['1', 1]);

  t.deepEqual(base10.serialize('42'), new Uint8Array([42]));
  t.deepEqual(base10.deserialize(new Uint8Array([42])), ['42', 1]);

  t.deepEqual(base10.serialize('1024'), new Uint8Array([4, 0]));
  t.deepEqual(base10.deserialize(new Uint8Array([4, 0])), ['1024', 2]);

  t.deepEqual(base10.serialize('65535'), new Uint8Array([255, 255]));
  t.deepEqual(base10.deserialize(new Uint8Array([255, 255])), ['65535', 2]);

  t.throws(() => base10.serialize('INVALID_INPUT'), {
    message: (m) =>
      m.includes('Expected a string of base 10, got [INVALID_INPUT].'),
  });
});

test('it can serialize base 16 strings', (t) => {
  t.deepEqual(base16.serialize(''), new Uint8Array([]));
  t.deepEqual(base16.deserialize(new Uint8Array([])), ['', 0]);

  t.deepEqual(base16.serialize('0'), new Uint8Array([0]));
  t.deepEqual(base16.serialize('00'), new Uint8Array([0]));
  t.deepEqual(base16.deserialize(new Uint8Array([0])), ['00', 1]);

  t.deepEqual(base16.serialize('1'), new Uint8Array([1]));
  t.deepEqual(base16.serialize('01'), new Uint8Array([1]));
  t.deepEqual(base16.deserialize(new Uint8Array([1])), ['01', 1]);

  t.deepEqual(base16.serialize('2a'), new Uint8Array([42]));
  t.deepEqual(base16.deserialize(new Uint8Array([42])), ['2a', 1]);

  t.deepEqual(base16.serialize('0400'), new Uint8Array([4, 0]));
  t.deepEqual(base16.deserialize(new Uint8Array([4, 0])), ['0400', 2]);

  t.deepEqual(base16.serialize('ffff'), new Uint8Array([255, 255]));
  t.deepEqual(base16.deserialize(new Uint8Array([255, 255])), ['ffff', 2]);

  t.throws(() => base16.serialize('INVALID_INPUT'), {
    message: (m) =>
      m.includes('Expected a string of base 16, got [INVALID_INPUT].'),
  });
});

test('it can serialize base 58 strings', (t) => {
  t.deepEqual(base58.serialize(''), new Uint8Array([]));
  t.deepEqual(base58.deserialize(new Uint8Array([])), ['', 0]);

  t.deepEqual(base58.serialize('1'), new Uint8Array([0]));
  t.deepEqual(base58.deserialize(new Uint8Array([0])), ['1', 1]);

  t.deepEqual(base58.serialize('2'), new Uint8Array([1]));
  t.deepEqual(base58.deserialize(new Uint8Array([1])), ['2', 1]);

  t.deepEqual(base58.serialize('j'), new Uint8Array([42]));
  t.deepEqual(base58.deserialize(new Uint8Array([42])), ['j', 1]);

  t.deepEqual(base58.serialize('Jf'), new Uint8Array([4, 0]));
  t.deepEqual(base58.deserialize(new Uint8Array([4, 0])), ['Jf', 2]);

  t.deepEqual(base58.serialize('LUv'), new Uint8Array([255, 255]));
  t.deepEqual(base58.deserialize(new Uint8Array([255, 255])), ['LUv', 2]);

  const pubkey = 'LorisCg1FTs89a32VSrFskYDgiRbNQzct1WxyZb7nuA';
  const bytes = new Uint8Array([
    5, 19, 4, 94, 5, 47, 73, 25, 182, 8, 150, 61, 231, 60, 102, 110, 6, 114,
    224, 110, 40, 20, 10, 184, 65, 191, 241, 204, 131, 161, 120, 181,
  ]);
  t.deepEqual(base58.serialize(pubkey), bytes);
  t.deepEqual(base58.deserialize(bytes), [pubkey, 32]);

  t.throws(() => base58.serialize('INVALID_INPUT'), {
    message: (m) =>
      m.includes('Expected a string of base 58, got [INVALID_INPUT].'),
  });
});
