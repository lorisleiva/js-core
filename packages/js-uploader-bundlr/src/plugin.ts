import type { MetaplexPlugin } from '@lorisleiva/js-core';
import { BundlrOptions, BundlrUploader } from './BundlrUploader';

export const bundlrUploader = (options?: BundlrOptions): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.uploader = new BundlrUploader(metaplex, options);
  },
});
