import test from 'ava';
import { mapSerializer, Serializer } from '../src';

test('[Serializer] playground', (t) => {
  const serializer: Serializer<number> = {
    description: 'number',
    serialize: (value: number) => new Uint8Array([value]),
    deserialize: (buffer: Uint8Array): [number, number] => [buffer[0], 1],
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

  type DummyStrict = { discriminator: number; label: string };
  type DummyLoose = { discriminator?: number; label: string };
  const serializer6: Serializer<DummyStrict> = {
    description: 'DummyStrict',
    serialize: (value: DummyStrict) =>
      new Uint8Array([value.discriminator, value.label.length]),
    deserialize: (buffer: Uint8Array): [DummyStrict, number] => [
      { discriminator: buffer[0], label: 'x'.repeat(buffer[1]) },
      1,
    ],
  };
  log(serializer6, { discriminator: 5, label: 'hello world!' });

  const serializer7: Serializer<DummyLoose, DummyStrict> = mapSerializer(
    serializer6,
    (value: DummyLoose): DummyStrict => ({ discriminator: 3, ...value })
  );
  log(serializer7, { discriminator: 5, label: 'hello world!' });
  log(serializer7, { label: 'hello world!' });
  t.pass();
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
