import test from 'ava';
import { fetchHttp } from '../src';

test('example test', async (t) => {
  t.is(typeof fetchHttp, 'function');
});
