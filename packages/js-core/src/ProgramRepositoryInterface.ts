import type { ClusterFilter } from './Cluster';
import type { Context } from './Context';
import { InterfaceImplementationMissingError, ProgramError } from './errors';
import type { ErrorWithLogs, Program } from './Program';
import type { PublicKey, PublicKeyInput } from './PublicKey';
import { Transaction } from './Transaction';

export interface ProgramRepositoryInterface {
  get<T extends Program = Program>(
    nameOrAddress: string | PublicKey,
    clusterFilter?: ClusterFilter
  ): T;
  all(clusterFilter?: ClusterFilter): Program[];
  add(program: Program): void;
  resolveError(
    error: ErrorWithLogs,
    transaction: Transaction
  ): ProgramError | null;
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
    throw new InterfaceImplementationMissingError(
      'ProgramRepositoryInterface',
      'programs'
    );
  }

  all(): Program[] {
    throw new InterfaceImplementationMissingError(
      'ProgramRepositoryInterface',
      'programs'
    );
  }

  add(): void {
    throw new InterfaceImplementationMissingError(
      'ProgramRepositoryInterface',
      'programs'
    );
  }

  resolveError(): ProgramError | null {
    throw new InterfaceImplementationMissingError(
      'ProgramRepositoryInterface',
      'programs'
    );
  }
}
