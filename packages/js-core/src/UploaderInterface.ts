import type { Amount, AmountDecimals, AmountIdentifier } from './Amount';
import { InterfaceImplementationMissingError } from './errors';
import type { GenericAbortSignal } from './GenericAbortSignal';
import type { GenericFile } from './GenericFile';

export interface UploaderInterface {
  upload: (
    files: GenericFile[],
    options?: UploaderUploadOptions
  ) => Promise<string[]>;

  uploadJson: <T>(json: T, options?: UploaderUploadOptions) => Promise<string>;

  getUploadPrice: <
    I extends AmountIdentifier = AmountIdentifier,
    D extends AmountDecimals = AmountDecimals
  >(
    files: GenericFile[],
    options?: UploaderGetUploadPriceOptions
  ) => Promise<Amount<I, D>>;
}

export type UploaderGetUploadPriceOptions = {
  signal?: GenericAbortSignal;
};

export type UploaderUploadOptions = {
  onProgress?: (percent: number, ...args: any) => void;
  signal?: GenericAbortSignal;
};

export class NullUploader implements UploaderInterface {
  private readonly error = new InterfaceImplementationMissingError(
    'UploaderInterface',
    'uploader'
  );

  upload(): Promise<string[]> {
    throw this.error;
  }

  uploadJson(): Promise<string> {
    throw this.error;
  }

  getUploadPrice<
    I extends AmountIdentifier = AmountIdentifier,
    D extends AmountDecimals = AmountDecimals
  >(): Promise<Amount<I, D>> {
    throw this.error;
  }
}
