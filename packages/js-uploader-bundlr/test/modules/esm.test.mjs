/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import { createMetaplex, generatedSignerIdentity } from '@lorisleiva/js-core';
import { web3JsRpc } from '@lorisleiva/js-rpc-web3js';
import { web3JsEddsa } from '@lorisleiva/js-eddsa-web3js';
import * as exported from '../../dist/esm/index.mjs';

test('it successfully exports esm named exports', (t) => {
  const exportedKeys = Object.keys(exported);

  t.true(exportedKeys.includes('BundlrUploader'));
});

test('it can import the Bundlr client', async (t) => {
  const { BundlrUploader } = exported;
  const context = createMetaplex()
    .use(web3JsRpc('http://localhost:8899'))
    .use(web3JsEddsa())
    .use(generatedSignerIdentity());
  const bundlrUploader = new BundlrUploader(context);
  const bundlr = await bundlrUploader.bundlr();
  t.true(typeof bundlr === 'object', 'Bundlr is an object');
  t.true('uploader' in bundlr, 'Bundlr can upload');
  t.true('getLoadedBalance' in bundlr, 'Bundlr can get the loaded balance');
  t.true('fund' in bundlr, 'Bundlr can fund');
  t.true('withdrawBalance' in bundlr, 'Bundlr can withdraw');
});
