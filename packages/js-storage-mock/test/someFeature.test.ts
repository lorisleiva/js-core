import test from 'ava';
import { myPlugin } from '../src';

test('[js-storage-mock] it tests some dummy feature', async (t) => {
  t.is(typeof myPlugin, 'function');
});
