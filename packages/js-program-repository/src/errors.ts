import {
  Cluster,
  PublicKey,
  SdkError,
  formatPublicKey,
} from '@lorisleiva/js-core';

export class ProgramNotRecognizedError extends SdkError {
  readonly name: string = 'ProgramNotRecognizedError';

  readonly nameOrAddress: string | PublicKey;

  readonly cluster: Cluster | '*';

  constructor(nameOrAddress: string | PublicKey, cluster: Cluster | '*') {
    const isName = typeof nameOrAddress === 'string';
    const toString = isName ? nameOrAddress : formatPublicKey(nameOrAddress);
    const clusterString = cluster === '*' ? 'any' : `the [${cluster}]`;
    const message =
      `The provided program ${isName ? 'name' : 'address'} [${toString}] ` +
      `is not recognized in ${clusterString} cluster.` +
      'Did you forget to register this program? ' +
      'If so, you may use "context.programs.add(myProgram)" to fix this.';
    super(message);
    this.nameOrAddress = nameOrAddress;
    this.cluster = cluster;
  }
}
