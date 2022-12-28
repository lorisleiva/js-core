export const hexToBytes = (value: string): Uint8Array => {
  const matches = value.match(/.{1,2}/g);
  return Uint8Array.from(
    matches ? matches.map((byte: string) => parseInt(byte, 16)) : []
  );
};

export const bytesToHex = (bytes: Uint8Array): string =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const mergeBytes = (bytesArr: Uint8Array[]): Uint8Array => {
  const totalLength = bytesArr.reduce((total, arr) => total + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  bytesArr.forEach((arr) => {
    result.set(arr, offset);
    offset += arr.length;
  });
  return result;
};
