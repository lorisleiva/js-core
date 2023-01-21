import { formatPublicKey, PublicKey } from '../PublicKey';
import { SdkError } from './SdkError';

/** @group Errors */
export class AccountNotFoundError extends SdkError {
  readonly name: string = 'AccountNotFoundError';

  constructor(address: PublicKey, accountType?: string, solution?: string) {
    const message = `${
      accountType
        ? `The account of type [${accountType}] was not found`
        : 'No account was found'
    } at the provided address [${formatPublicKey(address)}].${
      solution ? ` ${solution}` : ''
    }`;
    super(message);
  }
}
