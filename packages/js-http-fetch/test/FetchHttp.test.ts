import test from 'ava';
import { request } from '@lorisleiva/js-core';
import { fetchHttp, FetchHttp } from '../src';

const BASE_URL = 'http://localhost:3000';

test('example test', async (t) => {
  t.is(typeof fetchHttp, 'function');
});

test.only('example test 2', async (t) => {
  const http = new FetchHttp();
  const response = await http.send(request().get(`${BASE_URL}/users`).asJson());
  console.log(response);
  t.pass();
});
