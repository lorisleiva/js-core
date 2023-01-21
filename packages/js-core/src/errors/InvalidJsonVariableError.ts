import { SdkError } from './SdkError';

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
