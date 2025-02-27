/* eslint-disable import/no-extraneous-dependencies */
const test = require('ava');
const {
  createMetaplex,
  generatedSignerIdentity,
} = require('@lorisleiva/js-core');
const { web3JsRpc } = require('@lorisleiva/js-rpc-web3js');
const { web3JsEddsa } = require('@lorisleiva/js-eddsa-web3js');
const exported = require('../../dist/cjs/index.cjs');

test('it successfully exports commonjs named exports', (t) => {
  const exportedKeys = Object.keys(exported);

  t.true(exportedKeys.includes('BundlrUploader'));
});

test('it can import the Bundlr client', async (t) => {
  const { BundlrUploader } = exported;
  const context = createMetaplex()
    .use(web3JsRpc('http://localhost:8899'))
    .use(web3JsEddsa())
    .use(generatedSignerIdentity());
  const bundlrDriver = new BundlrUploader(context);
  const bundlr = await bundlrDriver.bundlr();
  t.true(typeof bundlr === 'object', 'Bundlr is an object');
  t.true('uploader' in bundlr, 'Bundlr can upload');
  t.true('getLoadedBalance' in bundlr, 'Bundlr can get the loaded balance');
  t.true('fund' in bundlr, 'Bundlr can fund');
  t.true('withdrawBalance' in bundlr, 'Bundlr can withdraw');
});
