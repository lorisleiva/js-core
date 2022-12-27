import type { Serializer } from './Serializer';

export type Option<T> = T | null;

export type WrapInSerializer<T> = {
  [P in keyof T]: Serializer<T[P]>;
};

export type ScalarEnum<T> =
  | { [key: number | string]: string | number | T }
  | number
  | T;

export type DataEnumUnion = { __kind: string };

export type DataEnumRecord<T extends DataEnumUnion> = {
  [P in T['__kind']]: Extract<T, { __kind: P }>;
};

export type StructToSerializerTuple<T extends object> = Array<
  {
    [K in keyof T]: T[K] extends undefined ? [K] : [K, Serializer<T[K]>];
  }[keyof T]
>;

export type DataEnumToSerializerTuple<T extends DataEnumUnion> = Array<
  T extends any ? [T['__kind'], Serializer<Omit<T, '__kind'>>] : never
>;
