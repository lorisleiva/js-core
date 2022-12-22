import type { Cluster } from './Cluster';
import type { ProgramError } from './errors';
import type { PublicKey } from './PublicKey';

export type ErrorWithLogs = Error & { logs: string[] };
export type ErrorWithCode = Error & { code: number };

export const isErrorWithLogs = (error: unknown): error is ErrorWithLogs =>
  error instanceof Error && 'logs' in error;

export type Program = {
  name: string;
  address: PublicKey;
  getErrorFromCode: (code: number) => ProgramError | null;
  getErrorFromName: (name: string) => ProgramError | null;
  isOnCluster: (cluster: Cluster) => boolean;
};
