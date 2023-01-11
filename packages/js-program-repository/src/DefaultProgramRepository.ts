import {
  Cluster,
  ClusterFilter,
  Context,
  ErrorWithLogs,
  Program,
  ProgramError,
  ProgramRepositoryInterface,
  PublicKey,
  samePublicKey,
} from '@lorisleiva/js-core';
import { ProgramNotRecognizedError } from './errors';

export class DefaultProgramRepository implements ProgramRepositoryInterface {
  protected programs: Program[] = [];

  constructor(protected readonly context: Pick<Context, 'rpc'>) {}

  get<T extends Program = Program>(
    nameOrAddress: string | PublicKey,
    clusterFilter: ClusterFilter = 'current'
  ): T {
    const cluster = this.parseClusterFilter(clusterFilter);
    const programs = this.all(clusterFilter);
    const program =
      typeof nameOrAddress === 'string'
        ? programs.find((p) => p.name === nameOrAddress)
        : programs.find((p) => samePublicKey(p.address, nameOrAddress));

    if (!program) {
      throw new ProgramNotRecognizedError(nameOrAddress, cluster);
    }

    return program as T;
  }

  all(clusterFilter: ClusterFilter = 'current'): Program[] {
    const cluster = this.parseClusterFilter(clusterFilter);
    return cluster === '*'
      ? this.programs
      : this.programs.filter((program) => program.isOnCluster(cluster));
  }

  add(program: Program): void {
    this.programs.unshift(program);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveError(error: ErrorWithLogs): ProgramError | null {
    throw new Error('Method not implemented.');
  }

  protected parseClusterFilter(clusterFilter: ClusterFilter): Cluster | '*' {
    return clusterFilter === 'current'
      ? this.context.rpc.getCluster()
      : clusterFilter;
  }
}
