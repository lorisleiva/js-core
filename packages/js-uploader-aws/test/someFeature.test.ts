import test from 'ava';
import { awsUploader } from '../src';

test('example test', async (t) => {
  t.is(typeof awsUploader, 'function');
});
