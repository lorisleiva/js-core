import test, { Test } from 'tape';
import { loosenSerializer, mapSerializer, Serializer } from '../src';

test('[Serializer] playground', (t: Test) => {
  const serializer: Serializer<number> = {
    description: 'number',
    serialize: (value: number) => {
      return new Uint8Array([value]);
    },
    deserialize: (buffer: Uint8Array): [number, number] => {
      return [buffer[0], 1];
    },
  };

  log(serializer, 42);

  const serializer2: Serializer<number | string, number> = mapSerializer(
    serializer,
    (value: number | string) =>
      typeof value === 'number' ? value : value.length,
    (n) => n
  );
  log(serializer2, 'hello world!');

  t.end();
});

function log<From, V extends From, To extends From = From>(
  serializer: Serializer<From, To>,
  value: V
) {
  const buffer = serializer.serialize(value);
  const [deserialized] = serializer.deserialize(buffer);
  console.log({ buffer, deserialized });
}
