import type { Context } from './Context';
import type { PublicKeyInput } from './EddsaInterface';
import type { ProgramError } from './errors';
import type { ErrorWithLogs, Program } from './Program';
import type { PublicKey } from './PublicKey';

export interface ProgramRepositoryInterface {
  get<T extends Program = Program>(nameOrAddress: string | PublicKey): T;
  all(): Program[];
  add(program: Program): void;
  resolveError(error: ErrorWithLogs): ProgramError | null;
}

export const getProgramAddressWithFallback = (
  context: {
    eddsa: Context['eddsa'];
    programs?: Context['programs'];
  },
  name: string,
  address: PublicKeyInput
) => {
  const publicKey = context.eddsa.createPublicKey(address);
  if (!context.programs) return publicKey;
  try {
    return context.programs?.get(name).address;
  } catch (error) {
    return publicKey;
  }
};

export class NullProgramRepository implements ProgramRepositoryInterface {
  get<T extends Program = Program>(): T {
    // TODO(loris): Custom error.
    throw Error('ProgramRepositoryInterface not implemented.');
  }
  all(): Program[] {
    throw Error('ProgramRepositoryInterface not implemented.');
  }
  add(): void {
    throw Error('ProgramRepositoryInterface not implemented.');
  }
  resolveError(): ProgramError | null {
    throw Error('ProgramRepositoryInterface not implemented.');
  }
}
