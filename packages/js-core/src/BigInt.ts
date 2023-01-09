export type BigIntInput = number | string | boolean | bigint | Uint8Array;

export const toBigInt = (input: BigIntInput): bigint => {
  input = typeof input === 'object' ? input.toString() : input;
  return BigInt(input);
};
