import test from 'ava';
import { web3JsRpc } from '../src';

test('example test', async (t) => {
  t.is(typeof web3JsRpc, 'function');
});
