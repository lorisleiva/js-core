import { MetaplexPlugin } from '@lorisleiva/js-core';
import { beetSerializer } from '@lorisleiva/js-serializer-beet';
import { eddsaWeb3Js } from '@lorisleiva/js-eddsa-web3js';

export const defaultPlugins = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.use(beetSerializer());
    metaplex.use(eddsaWeb3Js());
  },
});
