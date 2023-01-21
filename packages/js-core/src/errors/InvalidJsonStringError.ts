import { SdkError } from './SdkError';

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
