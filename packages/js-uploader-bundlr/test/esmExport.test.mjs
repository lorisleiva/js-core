/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import { Connection } from '@solana/web3.js';
import * as exported from '../dist/esm/index.mjs';

test('it successfully exports esm named exports', (t) => {
  const exportedKeys = Object.keys(exported);

  t.true(exportedKeys.includes('BundlrUploader'));
});

test.skip('it can import the Bundlr client', async (t) => {
  const { BundlrStorageDriver, Metaplex } = exported;
  const connection = new Connection('http://localhost:8899');
  const metaplex = new Metaplex(connection);
  const bundlrDriver = new BundlrStorageDriver(metaplex);
  const bundlr = await bundlrDriver.bundlr();
  t.ok(typeof bundlr === 'object', 'Bundlr is an object');
  t.ok('uploader' in bundlr, 'Bundlr can upload');
  t.ok('getLoadedBalance' in bundlr, 'Bundlr can get the loaded balance');
  t.ok('fund' in bundlr, 'Bundlr can fund');
  t.ok('withdrawBalance' in bundlr, 'Bundlr can withdraw');
  t.end();
});
