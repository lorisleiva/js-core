import test from 'ava';
import { base10, base16, base58 } from '../../src';

test('it can serialize base 10 strings', (t) => {
  t.deepEqual(base10.serialize(''), new Uint8Array([]));
  t.deepEqual(base10.deserialize(new Uint8Array([])), ['', 0]);

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
  const pubkey = 'LorisCg1FTs89a32VSrFskYDgiRbNQzct1WxyZb7nuA';
  t.deepEqual(base58.serialize(pubkey), new Uint8Array([]));
  t.deepEqual(base58.deserialize(new Uint8Array([])), [pubkey, 0]);

  t.deepEqual(base58.serialize(''), new Uint8Array([]));
  t.deepEqual(base58.deserialize(new Uint8Array([])), ['', 0]);

  t.deepEqual(base58.serialize('1'), new Uint8Array([1]));
  t.deepEqual(base58.deserialize(new Uint8Array([1])), ['1', 1]);

  t.deepEqual(base58.serialize('2a'), new Uint8Array([42]));
  t.deepEqual(base58.deserialize(new Uint8Array([42])), ['2a', 1]);

  t.deepEqual(base58.serialize('0400'), new Uint8Array([4, 0]));
  t.deepEqual(base58.deserialize(new Uint8Array([4, 0])), ['0400', 2]);

  t.deepEqual(base58.serialize('ffff'), new Uint8Array([255, 255]));
  t.deepEqual(base58.deserialize(new Uint8Array([255, 255])), ['ffff', 2]);

  t.throws(() => base58.serialize('INVALID_INPUT'), {
    message: (m) =>
      m.includes('Expected a string of base 58, got [INVALID_INPUT].'),
  });
});
