import type { Context } from './Context';
import type { Instruction, WrappedInstruction } from './Instruction';
import type {
  RpcConfirmTransactionOptions,
  RpcConfirmTransactionResult,
  RpcConfirmTransactionStrategy,
  RpcSendTransactionOptions,
} from './RpcInterface';
import { deduplicateSigners, Signer } from './Signer';
import type {
  Blockhash,
  Transaction,
  TransactionInput,
  TransactionSignature,
} from './Transaction';

export type TransactionBuilderItemsInput =
  | WrappedInstruction
  | WrappedInstruction[]
  | TransactionBuilder
  | TransactionBuilder[];

export type TransactionBuilderBuildOptions = Omit<
  TransactionInput,
  'payer' | 'instructions'
>;

export type TransactionBuilderSendOptions = {
  build?: Partial<TransactionBuilderBuildOptions>;
  send?: RpcSendTransactionOptions;
  confirm?: Partial<RpcConfirmTransactionOptions>;
};

export type TransactionBuilderSendAndConfirmOptions =
  TransactionBuilderSendOptions & {
    confirm?: Partial<RpcConfirmTransactionOptions>;
  };

export class TransactionBuilder {
  constructor(
    protected readonly context: Pick<Context, 'rpc' | 'transactions' | 'payer'>,
    protected readonly items: WrappedInstruction[] = []
  ) {}

  static make(
    context: Pick<Context, 'rpc' | 'transactions' | 'payer'>,
    items: WrappedInstruction[] = []
  ): TransactionBuilder {
    return new TransactionBuilder(context, items);
  }

  prepend(input: TransactionBuilderItemsInput): TransactionBuilder {
    return new TransactionBuilder(this.context, [
      ...this.parseItems(input),
      ...this.items,
    ]);
  }

  append(input: TransactionBuilderItemsInput): TransactionBuilder {
    return new TransactionBuilder(this.context, [
      ...this.items,
      ...this.parseItems(input),
    ]);
  }

  add(input: TransactionBuilderItemsInput): TransactionBuilder {
    return this.append(input);
  }

  getInstructions(): Instruction[] {
    return this.items.map((item) => item.instruction);
  }

  getSigners(): Signer[] {
    return deduplicateSigners(this.items.flatMap((item) => item.signers));
  }

  build(options: TransactionBuilderBuildOptions): Transaction {
    return this.context.transactions.create({
      payer: this.context.payer.publicKey,
      instructions: this.getInstructions(),
      ...options,
    });
  }

  async buildAndSign(
    options: TransactionBuilderBuildOptions
  ): Promise<Transaction> {
    const signers = this.getSigners();
    let transaction = this.build(options);

    for (let i = 0; i < signers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      transaction = await signers[i].signTransaction(transaction);
    }

    return transaction;
  }

  async send(
    options: TransactionBuilderSendOptions = {}
  ): Promise<TransactionSignature> {
    const blockhash =
      options.build?.blockhash ??
      (await this.context.rpc.getLatestBlockhash()).blockhash;
    const transaction = await this.buildAndSign({
      blockhash,
      ...options.build,
    });
    return this.context.rpc.sendTransaction(
      this.context.transactions.serialize(transaction),
      options.send
    );
  }

  async sendAndConfirm(
    options: TransactionBuilderSendAndConfirmOptions
  ): Promise<{
    signature: TransactionSignature;
    result: RpcConfirmTransactionResult;
  }> {
    let blockhash: Blockhash;
    let strategy: RpcConfirmTransactionStrategy;
    if (options.confirm?.strategy && options.build?.blockhash) {
      blockhash = options.build.blockhash;
      strategy = options.confirm.strategy;
    } else {
      const latestBlockhash = await this.context.rpc.getLatestBlockhash();
      blockhash = latestBlockhash.blockhash;
      strategy = options.confirm?.strategy ?? {
        type: 'blockhash',
        ...latestBlockhash,
      };
    }

    const signature = await this.send({
      ...options,
      build: { blockhash, ...options.build },
    });
    const result = await this.context.rpc.confirmTransaction(signature, {
      strategy,
      ...options.confirm,
    });

    return { signature, result };
  }

  protected parseItems(
    input: TransactionBuilderItemsInput
  ): WrappedInstruction[] {
    return (Array.isArray(input) ? input : [input]).flatMap((item) =>
      'instruction' in item ? [item] : item.items
    );
  }
}
