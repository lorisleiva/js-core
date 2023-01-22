import {
  Cluster,
  displayPublicKey,
  Program,
  ProgramError,
  PublicKey,
  SdkError,
  UnderlyingProgramError,
} from '@lorisleiva/js-core';

export class ProgramNotRecognizedError extends SdkError {
  readonly name: string = 'ProgramNotRecognizedError';

  readonly identifier: string | PublicKey;

  readonly cluster: Cluster | '*';

  constructor(identifier: string | PublicKey, cluster: Cluster | '*') {
    const isName = typeof identifier === 'string';
    const toString = isName ? identifier : displayPublicKey(identifier);
    const clusterString = cluster === '*' ? 'any' : `the [${cluster}]`;
    const message =
      `The provided program ${isName ? 'name' : 'address'} [${toString}] ` +
      `is not recognized in ${clusterString} cluster.` +
      'Did you forget to register this program? ' +
      'If so, you may use "context.programs.add(myProgram)" to fix this.';
    super(message);
    this.identifier = identifier;
    this.cluster = cluster;
  }
}

/** @group Errors */
export class ProgramErrorNotRecognizedError extends ProgramError {
  readonly name: string = 'ProgramErrorNotRecognizedError';

  constructor(program: Program, cause: UnderlyingProgramError) {
    const ofCode = cause.code ? ` of code [${cause.code}]` : '';
    const message =
      `The program [${program.name}] ` +
      `at address [${displayPublicKey(program.publicKey)}] ` +
      `raised an error${ofCode} ` +
      `that is not recognized by the programs registered on the SDK. ` +
      `Please check the underlying program error below for more details.`;
    super(message, program, cause);
  }
}
