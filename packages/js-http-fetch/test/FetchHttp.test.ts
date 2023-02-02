import test from 'ava';
import { request } from '@lorisleiva/js-core';
import { fetchHttp, FetchHttp } from '../src';

test('example test', async (t) => {
  t.is(typeof fetchHttp, 'function');
});

test.only('example test 2', async (t) => {
  const http = new FetchHttp();
  const response = await http.send(
    request().get('https://jsonplaceholder.typicode.com/todos/1').asJson()
  );
  console.log(response);
  t.pass();
});
