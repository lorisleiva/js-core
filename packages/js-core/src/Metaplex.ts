import type { Context } from './Context';
import { NullDownloader } from './DownloaderInterface';
import { NullEddsa } from './EddsaInterface';
import type { MetaplexPlugin } from './MetaplexPlugin';
import { NullProgramRepository } from './ProgramRepositoryInterface';
import { NullSerializer } from './SerializerInterface';
import { NullSigner } from './Signer';
import { NullUploader } from './UploaderInterface';

export interface Metaplex
  extends Pick<
    Context,
    'uploader' | 'downloader' | 'identity' | 'eddsa' | 'programs' | 'serializer'
  > {
  use(plugin: MetaplexPlugin): Metaplex;
}

export const createMetaplex = (): Metaplex => ({
  uploader: new NullUploader(),
  downloader: new NullDownloader(),
  identity: new NullSigner(),
  eddsa: new NullEddsa(),
  programs: new NullProgramRepository(),
  serializer: new NullSerializer(),
  use(plugin: MetaplexPlugin) {
    plugin.install(this);
    return this;
  },
});
