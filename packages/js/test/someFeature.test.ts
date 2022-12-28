import test from 'ava';
import { defaultPlugins } from '../src';

test('example test', async (t) => {
  t.is(typeof defaultPlugins, 'function');
});
