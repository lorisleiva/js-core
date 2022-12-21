import type { Serializer } from './Serializer';

export type Lookup<T, K> = K extends keyof T ? T[K] : never;

export type RecordToTuple<T, K extends Array<keyof T> = Array<keyof T>> = {
  [I in keyof K]: [K[I], Lookup<T, K[I]>];
};

export type WrapInSerializer<T> = {
  [P in keyof T]: Serializer<T[P]>;
};
