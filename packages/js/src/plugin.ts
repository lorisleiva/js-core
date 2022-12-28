import { MetaplexPlugin } from '@lorisleiva/js-core';
import { beetSerializer } from '@lorisleiva/js-serializer-beet';
import { web3JsEddsa } from '@lorisleiva/js-eddsa-web3js';

export const defaultPlugins = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(beetSerializer());
    metaplex.use(web3JsEddsa());
  },
});
