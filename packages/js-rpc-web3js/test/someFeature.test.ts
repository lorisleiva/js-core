import test from 'ava';
import { ProgramRepositoryInterface } from '@lorisleiva/js-core';
import { web3JsRpc, Web3JsRpc } from '../src';

test('example test', async (t) => {
  t.is(typeof web3JsRpc, 'function');
  const rpc = new Web3JsRpc(
    { programs: {} as ProgramRepositoryInterface },
    'http://localhost:8899'
  );
  rpc.call('getAccount', ['some-address']);
});
