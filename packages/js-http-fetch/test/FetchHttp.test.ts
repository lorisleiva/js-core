import test from 'ava';
import { fetchHttp, FetchHttp } from '../src';

test('example test', async (t) => {
  t.is(typeof fetchHttp, 'function');
});

test.only('example test 2', async (t) => {
  const http = new FetchHttp();
  const foo = await http.send({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(foo);
  t.pass();
});
