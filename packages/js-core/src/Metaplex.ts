import type { Context } from './Context';
import { NullDownloader } from './DownloaderInterface';
import { NullEddsa } from './EddsaInterface';
import type { MetaplexPlugin } from './MetaplexPlugin';
import { NullProgramRepository } from './ProgramRepositoryInterface';
import { NullSerializer } from './SerializerInterface';
import { NullSigner } from './Signer';
import { NullTransactionFactory } from './TransactionFactoryInterface';
import { NullUploader } from './UploaderInterface';

export interface Metaplex
  extends Pick<
    Context,
    | 'downloader'
    | 'eddsa'
    // | 'http'
    | 'identity'
    | 'programs'
    // | 'rpc'
    | 'serializer'
    | 'transactions'
    | 'uploader'
  > {
  use(plugin: MetaplexPlugin): Metaplex;
}

export const createMetaplex = (): Metaplex => ({
  downloader: new NullDownloader(),
  eddsa: new NullEddsa(),
  // http: new NullHttp(),
  identity: new NullSigner(),
  programs: new NullProgramRepository(),
  // rpc: new NullRpc(),
  serializer: new NullSerializer(),
  transactions: new NullTransactionFactory(),
  uploader: new NullUploader(),
  use(plugin: MetaplexPlugin) {
    plugin.install(this);
    return this;
  },
});
