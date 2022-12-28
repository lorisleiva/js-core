import {
  Metaplex,
  createMetaplex as baseCreateMetaplex,
} from '@lorisleiva/js-core';
import { defaultPlugins } from './plugin';

export * from './plugin';

export const createMetaplex = (): Metaplex =>
  baseCreateMetaplex().use(defaultPlugins());
