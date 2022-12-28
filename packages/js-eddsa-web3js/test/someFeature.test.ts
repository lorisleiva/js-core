import test from 'ava';
import { eddsaWeb3Js } from '../src';

test('example test', async (t) => {
  t.is(typeof eddsaWeb3Js, 'function');
});
