import { formatPublicKey, PublicKey } from '../PublicKey';
import { SdkError } from './SdkError';

/** @group Errors */
export class UnexpectedAccountError extends SdkError {
  readonly name: string = 'UnexpectedAccountError';

  constructor(address: PublicKey, expectedType: string, cause?: Error) {
    const message =
      `The account at the provided address [${formatPublicKey(address)}] ` +
      `is not of the expected type [${expectedType}].`;
    super(message, cause);
  }
}
