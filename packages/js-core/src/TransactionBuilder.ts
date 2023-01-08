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

export type TransactionBuilderBuildInput = Omit<
  TransactionInput,
  'payer' | 'instructions'
>;

export class TransactionBuilder {
  constructor(
    private readonly context: Pick<Context, 'rpc' | 'transactions' | 'payer'>,
    private readonly items: WrappedInstruction[] = []
  ) {}

  static make(
    context: Pick<Context, 'rpc' | 'transactions' | 'payer'>,
    items: WrappedInstruction[] = []
  ): TransactionBuilder {
    return new TransactionBuilder(context, items);
  }

  prepend(
    instructions: WrappedInstruction | WrappedInstruction[]
  ): TransactionBuilder {
    const newItems = Array.isArray(instructions)
      ? instructions
      : [instructions];
    return new TransactionBuilder(this.context, [...newItems, ...this.items]);
  }

  append(
    instructions: WrappedInstruction | WrappedInstruction[]
  ): TransactionBuilder {
    const newItems = Array.isArray(instructions)
      ? instructions
      : [instructions];
    return new TransactionBuilder(this.context, [...this.items, ...newItems]);
  }

  add(
    instructions: WrappedInstruction | WrappedInstruction[]
  ): TransactionBuilder {
    return this.append(instructions);
  }

  getInstructions(): Instruction[] {
    return this.items.map((item) => item.instruction);
  }

  getSigners(): Signer[] {
    return deduplicateSigners(this.items.flatMap((item) => item.signers));
  }

  build(input: TransactionBuilderBuildInput): Transaction {
    return this.context.transactions.create({
      payer: this.context.payer.publicKey,
      instructions: this.getInstructions(),
      ...input,
    });
  }

  async buildAndSign(
    input: TransactionBuilderBuildInput
  ): Promise<Transaction> {
    const signers = this.getSigners();
    let transaction = this.build(input);

    for (let i = 0; i < signers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      transaction = await signers[i].signTransaction(transaction);
    }

    return transaction;
  }

  async send(
    input: Partial<TransactionBuilderBuildInput> = {},
    sendOptions: RpcSendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    const blockhash =
      input.blockhash ??
      (await this.context.rpc.getLatestBlockhash()).blockhash;
    const transaction = await this.buildAndSign({ blockhash, ...input });
    return this.context.rpc.sendTransaction(
      this.context.transactions.serialize(transaction),
      sendOptions
    );
  }

  async sendAndConfirm(
    input: Partial<TransactionBuilderBuildInput> = {},
    sendOptions: RpcSendTransactionOptions = {},
    confirmOptions: Partial<RpcConfirmTransactionOptions> = {}
  ): Promise<{
    signature: TransactionSignature;
    result: RpcConfirmTransactionResult;
  }> {
    let blockhash: Blockhash;
    let strategy: RpcConfirmTransactionStrategy;
    if (confirmOptions.strategy && input.blockhash) {
      blockhash = input.blockhash;
      strategy = confirmOptions.strategy;
    } else {
      const latestBlockhash = await this.context.rpc.getLatestBlockhash();
      blockhash = latestBlockhash.blockhash;
      strategy = confirmOptions.strategy ?? {
        type: 'blockhash',
        ...latestBlockhash,
      };
    }

    const signature = await this.send({ blockhash, ...input }, sendOptions);
    const result = await this.context.rpc.confirmTransaction(signature, {
      strategy,
      ...confirmOptions,
    });

    return { signature, result };
  }
}
