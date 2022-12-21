import type { Program } from './Program';
import type { PublicKey } from './PublicKey';

export interface ProgramRepositoryInterface {
  get<T extends Program = Program>(nameOrAddress: string | PublicKey): T;
  getAddress(
    nameOrAddress: string | PublicKey,
    fallback?: PublicKey
  ): PublicKey;
  all(): Program[];
  add(program: Program): void;
}
