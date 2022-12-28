import type { DownloaderInterface } from './DownloaderInterface';
import type { EddsaInterface } from './EddsaInterface';
import type { HttpInterface } from './HttpInterface';
import type { ProgramRepositoryInterface } from './ProgramRepositoryInterface';
import type { RpcInterface } from './RpcInterface';
import type { SerializerInterface } from './SerializerInterface';
import type { Signer } from './Signer';
import type { TransactionFactoryInterface } from './TransactionFactoryInterface';
import type { UploaderInterface } from './UploaderInterface';

export interface Context {
  downloader: DownloaderInterface;
  eddsa: EddsaInterface;
  http: HttpInterface;
  identity: Signer;
  programs: ProgramRepositoryInterface;
  rpc: RpcInterface;
  serializer: SerializerInterface;
  transactions: TransactionFactoryInterface;
  uploader: UploaderInterface;
}
