import type { Context } from './Context';
import type { PublicKeyInput } from './EddsaInterface';
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

export const getProgramAddressWithFallback = (
  context: {
    eddsa: Context['eddsa'];
    programs?: Context['programs'];
  },
  name: string,
  address: PublicKeyInput
) => {
  const publicKey = context.eddsa.createPublicKey(address);
  return context.programs?.getAddress(name, publicKey) ?? publicKey;
};
