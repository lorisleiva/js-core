export const hexToBytes = (value: string): Uint8Array => {
  const matches = value.match(/.{1,2}/g);
  return Uint8Array.from(
    matches ? matches.map((byte: string) => parseInt(byte, 16)) : []
  );
};

export const bytesToHex = (bytes: Uint8Array): string =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
