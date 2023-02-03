/* eslint-disable import/no-extraneous-dependencies */
const test = require('ava');
const { Connection } = require('@solana/web3.js');
const exported = require('../dist/cjs/index.cjs');

test('it successfully exports commonjs named exports', (t) => {
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
