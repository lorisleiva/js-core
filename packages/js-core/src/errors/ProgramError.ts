import { Program } from '../Program';
import { MetaplexError } from './MetaplexError';

type UnderlyingProgramError = Error & { code?: number; logs?: string[] };

/** @group Errors */
export class ProgramError extends MetaplexError {
  readonly name: string = 'ProgramError';
  readonly program: Program;
  readonly logs?: string[];

  constructor(
    message: string,
    program: Program,
    cause?: UnderlyingProgramError
  ) {
    super(
      message,
      'program',
      `${program.name} [${program.address.toString()}]`,
      cause
    );
    this.program = program;
    this.logs = cause?.logs;
    if (this.logs) {
      this.message =
        this.message +
        `\nProgram Logs:\n${this.logs.map((log) => '| ' + log).join('\n')}\n`;
    }
  }
}

/** @group Errors */
export class UnknownProgramError extends ProgramError {
  readonly name: string = 'UnknownProgramError';
  constructor(program: Program, cause: UnderlyingProgramError) {
    const ofCode = cause.code ? ` of code [${cause.code}]` : '';
    const message =
      `The program [${program.name}] ` +
      `at address [${program.address.toString()}] ` +
      `raised an error${ofCode} ` +
      `that is not recognized by the programs registered on the SDK. ` +
      `Please check the underlying program error below for more details.`;
    super(message, program, cause);
  }
}
