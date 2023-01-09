import { BigIntInput, toBigInt } from './BigInt';
import { mapSerializer, Serializer } from './Serializer';

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
  locales: Intl.LocalesArgument = 'en-US',
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

export const mapDateTimeSerializer = (
  serializer: Serializer<number> | Serializer<number | bigint, bigint>
): Serializer<DateTimeInput, DateTime> =>
  mapSerializer(
    serializer as Serializer<number | bigint>,
    (value: DateTimeInput): number | bigint => {
      const dateTime = toDateTime(value);
      return dateTime > Number.MAX_SAFE_INTEGER ? dateTime : Number(dateTime);
    },
    (value: number | bigint): DateTime => toDateTime(value)
  );
