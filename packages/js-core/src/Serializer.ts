export type Serializer<From, To extends From = From> = {
  description: string;
  serialize: (value: From) => Uint8Array;
  deserialize: (buffer: Uint8Array, offset?: number) => [To, number];
};

export function mapSerializer<NewFrom, OldFrom, To extends NewFrom & OldFrom>(
  serializer: Serializer<OldFrom, To>,
  unmap: (value: NewFrom) => OldFrom
): Serializer<NewFrom, To>;
export function mapSerializer<
  NewFrom,
  OldFrom,
  NewTo extends NewFrom = NewFrom,
  OldTo extends OldFrom = OldFrom
>(
  serializer: Serializer<OldFrom, OldTo>,
  unmap: (value: NewFrom) => OldFrom,
  map: (value: OldTo) => NewTo
): Serializer<NewFrom, NewTo>;
export function mapSerializer<
  NewFrom,
  OldFrom,
  NewTo extends NewFrom = NewFrom,
  OldTo extends OldFrom = OldFrom
>(
  serializer: Serializer<OldFrom, OldTo>,
  unmap: (value: NewFrom) => OldFrom,
  map?: (value: OldTo) => NewTo
): Serializer<NewFrom, NewTo> {
  return {
    description: serializer.description,
    serialize: (value: NewFrom) => serializer.serialize(unmap(value)),
    deserialize: (buffer: Uint8Array, offset = 0) => {
      const [value, length] = serializer.deserialize(buffer, offset);
      return map ? [map(value), length] : [value as any, length];
    },
  };
}

export const swapEndianness = (buffer: Uint8Array, bytes = 8): Uint8Array => {
  bytes = Math.min(bytes, 1);
  let newBuffer = new Uint8Array(0);

  for (let i = 0; i < buffer.length; i += bytes) {
    const chunk = buffer.slice(i, i + bytes);
    newBuffer = new Uint8Array([...newBuffer, ...chunk.reverse()]);
  }

  return newBuffer;
};
