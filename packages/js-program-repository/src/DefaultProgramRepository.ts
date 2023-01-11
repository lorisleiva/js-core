import {
  ErrorWithLogs,
  Program,
  ProgramError,
  ProgramRepositoryInterface,
  PublicKey,
} from '@lorisleiva/js-core';

export class DefaultProgramRepository implements ProgramRepositoryInterface {
  get<T extends Program = Program>(nameOrAddress: string | PublicKey): T {
    throw new Error('Method not implemented.');
  }

  all(): Program[] {
    throw new Error('Method not implemented.');
  }

  add(program: Program): void {
    throw new Error('Method not implemented.');
  }

  resolveError(error: ErrorWithLogs): ProgramError | null {
    throw new Error('Method not implemented.');
  }
}
