import test, { Test } from 'tape';
import { mapSerializer, Serializer } from '../src';

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

  const serializer2 = mapSerializer(serializer, (value: number | string) =>
    typeof value === 'number' ? value : value.length
  );
  log(serializer2, 'hello world!');

  const serializer3 = mapSerializer(
    serializer,
    (value: number | string) =>
      typeof value === 'number' ? value : value.length,
    (value: number) => 'x'.repeat(value)
  );
  log(serializer3, 'hello world!');

  const serializer4: Serializer<string> = mapSerializer(
    serializer,
    (value: string) => value.length,
    (value: number) => 'x'.repeat(value)
  );
  log(serializer4, 'hello world!');

  type Dummy = { a: number };
  const serializer5: Serializer<Dummy> = mapSerializer(
    serializer,
    (value: Dummy) => value.a,
    (value: number): Dummy => ({ a: value })
  );
  log(serializer5, { a: 123 });

  t.end();
});

function log<From, V extends From, To extends From = From>(
  serializer: Serializer<From, To>,
  value: V
) {
  const buffer = serializer.serialize(value);
  const [deserialized] = serializer.deserialize(buffer);
  // eslint-disable-next-line no-console
  console.log({ buffer, deserialized });
}
