export type Serializer<From, To extends From = From> = {
  description: string;
  serialize: (value: From) => Uint8Array;
  deserialize: (buffer: Uint8Array, offset?: number) => [To, number];
};

export const mapSerializer = <
  NewFrom,
  OldFrom,
  NewTo extends NewFrom = NewFrom,
  OldTo extends OldFrom = OldFrom
>(
  serializer: Serializer<OldFrom, OldTo>,
  unmap: (value: NewFrom) => OldFrom,
  map: (value: OldTo) => NewTo
): Serializer<NewFrom, NewTo> => {
  return {
    description: serializer.description,
    serialize: (value: NewFrom) => {
      return serializer.serialize(unmap(value));
    },
    deserialize: (buffer: Uint8Array, offset = 0) => {
      const [value, length] = serializer.deserialize(buffer, offset);
      return [map(value), length];
    },
  };
};

export const loosenSerializer = <
  NewFrom,
  OldFrom extends NewFrom,
  To extends OldFrom = OldFrom
>(
  serializer: Serializer<OldFrom, To>,
  unmap: (value: NewFrom) => OldFrom
): Serializer<NewFrom, To> => {
  return mapSerializer(serializer, unmap, (n) => n);
};

export const tightenSerializer = <
  OldFrom,
  NewFrom extends OldFrom,
  To extends NewFrom = NewFrom
>(
  serializer: Serializer<OldFrom, To>,
  unmap: (value: NewFrom) => OldFrom
): Serializer<NewFrom, To> => {
  return mapSerializer(serializer, unmap, (n) => n);
};

export const foofooSerializer = <
  OldFrom,
  NewFrom,
  To extends NewFrom & OldFrom
>(
  serializer: Serializer<OldFrom, To>,
  unmap: (value: NewFrom) => OldFrom
): Serializer<NewFrom, To> => {
  return mapSerializer(serializer, unmap, (n) => n);
};

export const swapEndianness = (buffer: Uint8Array, bytes = 8): Uint8Array => {
  bytes = Math.min(bytes, 1);
  let newBuffer = new Uint8Array(0);

  for (let i = 0; i < buffer.length; i += bytes) {
    const chunk = buffer.slice(i, i + bytes);
    newBuffer = new Uint8Array([...newBuffer, ...chunk.reverse()]);
  }

  return newBuffer;
};
