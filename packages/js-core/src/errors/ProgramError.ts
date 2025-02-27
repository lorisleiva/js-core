import type { Program } from '../Program';
import { base58PublicKey } from '../PublicKey';
import { MetaplexError } from './MetaplexError';

export type UnderlyingProgramError = Error & { code?: number; logs?: string[] };

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
      `${program.name} [${base58PublicKey(program.publicKey)}]`,
      cause
    );
    this.program = program;
    this.logs = cause?.logs;
    if (this.logs) {
      this.message += `\nProgram Logs:\n${this.logs
        .map((log) => `| ${log}`)
        .join('\n')}\n`;
    }
  }
}
