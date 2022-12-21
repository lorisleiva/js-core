import type { Serializer } from './Serializer';

export type RecordToTuple<T extends object> = [keyof T, T[keyof T]][];

export type WrapInSerializer<T> = {
  [P in keyof T]: Serializer<T[P]>;
};
