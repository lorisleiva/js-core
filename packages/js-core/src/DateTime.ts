import { BigIntInput, toBigInt } from './BigInt';

export type DateTimeString = string;
export type DateTimeInput = DateTimeString | BigIntInput | Date;
export type DateTime = bigint;

export const toDateTime = (value: DateTimeInput): DateTime => {
  if (typeof value === 'string' || isDateObject(value)) {
    const date = new Date(value);
    const timestamp = Math.floor(date.getTime() / 1000);
    return toBigInt(timestamp);
  }

  return toBigInt(value);
};

export const now = (): DateTime => toDateTime(new Date(Date.now()));

const isDateObject = (value: any): value is Date =>
  Object.prototype.toString.call(value) === '[object Date]';

export const formatDateTime = (
  value: DateTime,
  // @ts-ignore
  locales: Intl.LocalesArgument = 'en-US',
  // @ts-ignore
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
): string => {
  const date = new Date((value * 1000n).toString());

  return date.toLocaleDateString(locales, options);
};
