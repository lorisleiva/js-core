import { Amount, AmountDecimals, AmountIdentifier } from '../Amount';
import { formatPublicKey, PublicKey } from '../PublicKey';
import { MetaplexError } from './MetaplexError';

/** @group Errors */
export class SdkError extends MetaplexError {
  readonly name: string = 'SdkError';

  constructor(message: string, cause?: Error) {
    super(message, 'sdk', undefined, cause);
  }
}

/** @group Errors */
export class InterfaceImplementationMissingError extends SdkError {
  readonly name: string = 'InterfaceImplementationMissingError';

  constructor(interfaceName: string, contextVariable: string) {
    const interfaceBasename = interfaceName.replace(/Interface$/, '');
    const message =
      `Tried using ${interfaceName} but no implementation of that interface was found. ` +
      `Make sure an implementation is registered, ` +
      `e.g. via "context.${contextVariable} = new My${interfaceBasename}();".`;
    super(message);
  }
}

/** @group Errors */
export class UnexpectedAmountError extends SdkError {
  readonly name: string = 'UnexpectedAmountError';

  readonly amount: Amount;

  readonly expectedIdentifier: AmountIdentifier;

  readonly expectedDecimals: AmountDecimals;

  constructor(
    amount: Amount,
    expectedIdentifier: AmountIdentifier,
    expectedDecimals: AmountDecimals
  ) {
    const message =
      `Expected amount of type [${expectedIdentifier} with ${expectedDecimals} decimals] ` +
      `but got [${amount.identifier} with ${amount.decimals} decimals]. ` +
      `Ensure the provided Amount is of the expected type.`;
    super(message);
    this.amount = amount;
    this.expectedIdentifier = expectedIdentifier;
    this.expectedDecimals = expectedDecimals;
  }
}

/** @group Errors */
export class AmountMismatchError extends SdkError {
  readonly name: string = 'AmountMismatchError';

  readonly left: Amount;

  readonly right: Amount;

  readonly operation?: string;

  constructor(left: Amount, right: Amount, operation?: string) {
    const wrappedOperation = operation ? ` [${operation}]` : '';
    const message =
      `The SDK tried to execute an operation${wrappedOperation} on two amounts of different types: ` +
      `[${left.identifier} with ${left.decimals} decimals] and ` +
      `[${right.identifier} with ${right.decimals} decimals]. ` +
      `Provide both amounts in the same type to perform this operation.`;
    super(message);
    this.left = left;
    this.right = right;
    this.operation = operation;
  }
}

/** @group Errors */
export class InvalidJsonVariableError extends SdkError {
  readonly name: string = 'InvalidJsonVariableError';

  constructor(cause?: Error) {
    super(
      'The provided JSON variable could not be parsed into a string.',
      cause
    );
  }
}

/** @group Errors */
export class InvalidJsonStringError extends SdkError {
  readonly name: string = 'InvalidJsonStringError';

  constructor(cause?: Error) {
    super(
      'The provided string could not be parsed into a JSON variable.',
      cause
    );
  }
}

/** @group Errors */
export class OperationUnauthorizedForGuestsError extends SdkError {
  readonly name: string = 'OperationUnauthorizedForGuestsError';

  constructor(operation: string) {
    const message =
      `Trying to access the [${operation}] operation as a guest. ` +
      `Ensure your wallet is connected using the identity driver. ` +
      `For instance, by using "metaplex.use(walletAdapterIdentity(wallet))" or ` +
      `"metaplex.use(keypairIdentity(keypair))".`;
    super(message);
  }
}

/** @group Errors */
export class AssetNotFoundError extends SdkError {
  readonly name: string = 'AssetNotFoundError';

  constructor(location: string) {
    super(`The asset at [${location}] could not be found.`);
  }
}

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

/** @group Errors */
export class InvalidBaseStringError extends SdkError {
  readonly name: string = 'InvalidBaseStringError';

  constructor(value: string, base: number) {
    const message = `Expected a string of base ${base}, got [${value}].`;
    super(message);
  }
}

/** @group Errors */
export class NotYetImplementedError extends SdkError {
  readonly name: string = 'NotYetImplementedError';

  constructor() {
    const message = `This feature is not yet implemented. Please check back later.`;
    super(message);
  }
}

/** @group Errors */
export class UnreachableCaseError extends SdkError {
  readonly name: string = 'UnreachableCaseError';

  constructor(value: never) {
    const message =
      `A switch statement is not handling the provided case [${value}]. ` +
      `Check your inputs or raise an issue to have ensure all cases are handled properly.`;
    super(message);
  }
}
