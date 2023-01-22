import { displayPublicKey, PublicKey } from '../PublicKey';
import { SdkError } from './SdkError';

/** @group Errors */
export class AccountNotFoundError extends SdkError {
  readonly name: string = 'AccountNotFoundError';

  constructor(publicKey: PublicKey, accountType?: string, solution?: string) {
    const message = `${
      accountType
        ? `The account of type [${accountType}] was not found`
        : 'No account was found'
    } at the provided address [${displayPublicKey(publicKey)}].${
      solution ? ` ${solution}` : ''
    }`;
    super(message);
  }
}
