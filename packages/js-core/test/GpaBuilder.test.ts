import test from 'ava';
import {
  base58,
  createNullContext,
  defaultPublicKey,
  GpaBuilder,
  gpaBuilder,
  StructToSerializerTuple,
} from '../src';

function getTestGpaBuilder<T extends object = {}>(
  fields?: StructToSerializerTuple<T, T>
): GpaBuilder<T> {
  const context = createNullContext();
  return gpaBuilder(context, defaultPublicKey(), fields);
}

test('it can add a data slice', (t) => {
  let builder = getTestGpaBuilder().slice(42, 10);
  t.deepEqual(builder.options.dataSlice, { offset: 42, length: 10 });

  builder = getTestGpaBuilder().slice(0, 0);
  t.deepEqual(builder.options.dataSlice, { offset: 0, length: 0 });

  builder = getTestGpaBuilder().withoutData();
  t.deepEqual(builder.options.dataSlice, { offset: 0, length: 0 });
});

test('it can add data size filters', (t) => {
  const builder = getTestGpaBuilder().whereSize(42);
  t.deepEqual(builder.options.filters?.[0], { dataSize: 42 });
});

test('it can add memcmp filters', (t) => {
  let builder = getTestGpaBuilder().where(42, 'Banana');
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: base58.serialize('Banana') },
  });

  builder = getTestGpaBuilder().where(42, 123);
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: new Uint8Array([123]) },
  });

  builder = getTestGpaBuilder().where(42, 123n);
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: new Uint8Array([123]) },
  });

  builder = getTestGpaBuilder().where(42, true);
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: new Uint8Array([1]) },
  });

  builder = getTestGpaBuilder().where(42, false);
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: new Uint8Array([0]) },
  });

  builder = getTestGpaBuilder().where(42, new Uint8Array([1, 2, 3]));
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: new Uint8Array([1, 2, 3]) },
  });

  builder = getTestGpaBuilder().where(42, defaultPublicKey());
  t.deepEqual(builder.options.filters?.[0], {
    memcmp: { offset: 42, bytes: defaultPublicKey().bytes },
  });
});

// it can add memcmp filters from fields (where)
