/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BlockhashWithExpiryBlockHeight,
  Cluster,
  Commitment,
  Context,
  MaybeRpcAccount,
  PublicKey,
  RpcConfirmResult,
  RpcInterface,
  RpcOptions,
  RpcSendOptions,
} from '@lorisleiva/js-core';

export class Web3JsRpc implements RpcInterface {
  getEndpoint(): string {
    throw new Error('Method not implemented.');
  }

  getCluster(): Cluster {
    throw new Error('Method not implemented.');
  }

  getAccount(address: PublicKey): Promise<MaybeRpcAccount> {
    throw new Error('Method not implemented.');
  }

  call<Result, Params extends any[]>(
    method: string,
    params?: [...Params] | undefined,
    options?: RpcOptions | undefined
  ): Promise<Result> {
    throw new Error('Method not implemented.');
  }

  sendTransaction(
    serializedTransaction: Uint8Array,
    context: Pick<Context, 'programs'>,
    options?: RpcSendOptions | undefined
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  confirmTransaction(
    signature: string,
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight,
    commitment?: Commitment | undefined
  ): Promise<RpcConfirmResult> {
    throw new Error('Method not implemented.');
  }
}
