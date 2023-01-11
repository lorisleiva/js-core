import { Context, createNullContext } from './Context';
import type { MetaplexPlugin } from './MetaplexPlugin';
import { TransactionBuilder } from './TransactionBuilder';

export interface Metaplex extends Context {
  use(plugin: MetaplexPlugin): Metaplex;
  transactionBuilder(): TransactionBuilder;
}

export const createMetaplex = (): Metaplex => ({
  ...createNullContext(),
  use(plugin: MetaplexPlugin) {
    plugin.install(this);
    return this;
  },
  transactionBuilder() {
    return TransactionBuilder.make(this);
  },
});
