import type { Serializer } from './Serializer';

export type WrapInSerializer<T> = {
  [P in keyof T]: Serializer<T[P]>;
};
