// eslint-disable-next-line import/no-named-default
import type { default as NodeBundlr, WebBundlr } from '@bundlr-network/client';
import {
  base58,
  Commitment,
  Context,
  createGenericFileFromJson,
  createSignerFromKeypair,
  GenericFile,
  GenericFileTag,
  isKeypairSigner,
  Keypair,
  lamports,
  samePublicKey,
  Signer,
  signTransaction,
  SolAmount,
  UploaderInterface,
} from '@lorisleiva/js-core';
import {
  fromWeb3JsKeypair,
  fromWeb3JsLegacyTransaction,
  toWeb3JsLegacyTransaction,
  toWeb3JsPublicKey,
} from '@lorisleiva/js-web3js-adapters';
import {
  Connection as Web3JsConnection,
  Keypair as Web3JsKeypair,
  PublicKey as Web3JsPublicKey,
  SendOptions as Web3JsSendOptions,
  Signer as Web3JsSigner,
  Transaction as Web3JsTransaction,
  TransactionSignature as Web3JsTransactionSignature,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Buffer } from 'buffer';
import {
  AssetUploadFailedError,
  BundlrWithdrawError,
  FailedToConnectToBundlrAddressError,
  FailedToInitializeBundlrError,
} from './errors';

/**
 * This method is necessary to import the Bundlr package on both ESM and CJS modules.
 * Without this, we get a different structure on each module:
 * - CJS: { default: [Getter], WebBundlr: [Getter] }
 * - ESM: { default: { default: [Getter], WebBundlr: [Getter] } }
 * This method fixes this by ensure there is not double default in the imported package.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function _removeDoubleDefault(pkg: any) {
  if (
    pkg &&
    typeof pkg === 'object' &&
    'default' in pkg &&
    'default' in pkg.default
  ) {
    return pkg.default;
  }

  return pkg;
}

export type BundlrUploaderOptions = {
  address?: string;
  timeout?: number;
  providerUrl?: string;
  priceMultiplier?: number;
  payer?: Signer;
};

export type BundlrWalletAdapter = {
  publicKey: Web3JsPublicKey | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction?: (
    transaction: Web3JsTransaction
  ) => Promise<Web3JsTransaction>;
  signAllTransactions?: (
    transactions: Web3JsTransaction[]
  ) => Promise<Web3JsTransaction[]>;
  sendTransaction: (
    transaction: Web3JsTransaction,
    connection: Web3JsConnection,
    options?: Web3JsSendOptions & { signers?: Web3JsSigner[] }
  ) => Promise<Web3JsTransactionSignature>;
};

// Size of Bundlr transaction header.
const HEADER_SIZE = 2_000;

// Minimum file size for cost calculation.
const MINIMUM_SIZE = 80_000;

export class BundlrUploader implements UploaderInterface {
  protected context: Pick<Context, 'rpc' | 'payer' | 'eddsa'>;

  protected options: BundlrUploaderOptions;

  protected _bundlr: WebBundlr | NodeBundlr | null = null;

  constructor(
    context: Pick<Context, 'rpc' | 'payer' | 'eddsa'>,
    options: BundlrUploaderOptions = {}
  ) {
    this.context = context;
    this.options = {
      providerUrl: context.rpc.getEndpoint(),
      ...options,
    };
  }

  async getUploadPriceFromBytes(bytes: number): Promise<SolAmount> {
    const bundlr = await this.bundlr();
    const price = await bundlr.getPrice(bytes);

    return bigNumberToAmount(
      price.multipliedBy(this.options.priceMultiplier ?? 1.1)
    );
  }

  async getUploadPrice(files: GenericFile[]): Promise<SolAmount> {
    const bytes: number = files.reduce(
      (sum, file) =>
        sum + HEADER_SIZE + Math.max(MINIMUM_SIZE, file.buffer.byteLength),
      0
    );

    return this.getUploadPriceFromBytes(bytes);
  }

  async upload(files: GenericFile[]): Promise<string[]> {
    const bundlr = await this.bundlr();
    const amount = await this.getUploadPrice(files);
    await this.fund(amount);

    const promises = files.map(async (file) => {
      const buffer = Buffer.from(file.buffer);
      const { status, data } = await bundlr.uploader.upload(buffer, {
        tags: getGenericFileTagsWithContentType(file),
      });

      if (status >= 300) {
        throw new AssetUploadFailedError(status);
      }

      return `https://arweave.net/${data.id}`;
    });

    return Promise.all(promises);
  }

  async uploadJson<T>(json: T): Promise<string> {
    const file = createGenericFileFromJson(json);
    const uris = await this.upload([file]);
    return uris[0];
  }

  async getBalance(): Promise<SolAmount> {
    const bundlr = await this.bundlr();
    const balance = await bundlr.getLoadedBalance();

    return bigNumberToAmount(balance);
  }

  async fund(amount: SolAmount, skipBalanceCheck = false): Promise<void> {
    const bundlr = await this.bundlr();
    let toFund = amountToBigNumber(amount);

    if (!skipBalanceCheck) {
      const balance = await bundlr.getLoadedBalance();

      toFund = toFund.isGreaterThan(balance)
        ? toFund.minus(balance)
        : new BigNumber(0);
    }

    if (toFund.isLessThanOrEqualTo(0)) {
      return;
    }

    await bundlr.fund(toFund);
  }

  async withdrawAll(): Promise<void> {
    // TODO(loris): Replace with "withdrawAll" when available on Bundlr.
    const bundlr = await this.bundlr();
    const balance = await bundlr.getLoadedBalance();
    const minimumBalance = new BigNumber(5000);

    if (balance.isLessThan(minimumBalance)) {
      return;
    }

    const balanceToWithdraw = balance.minus(minimumBalance);
    await this.withdraw(bigNumberToAmount(balanceToWithdraw));
  }

  async withdraw(amount: SolAmount): Promise<void> {
    const bundlr = await this.bundlr();

    const { status } = await bundlr.withdrawBalance(amountToBigNumber(amount));

    if (status >= 300) {
      throw new BundlrWithdrawError(status);
    }
  }

  async bundlr(): Promise<WebBundlr | NodeBundlr> {
    const oldPayer = this._bundlr?.getSigner().publicKey;
    const newPayer = this.options.payer ?? this.context.payer;
    if (oldPayer && !samePublicKey(new Uint8Array(oldPayer), newPayer)) {
      this._bundlr = null;
    }

    if (!this._bundlr) {
      this._bundlr = await this.initBundlr();
    }

    return this._bundlr;
  }

  async initBundlr(): Promise<WebBundlr | NodeBundlr> {
    const currency = 'solana';
    const defaultAddress =
      this.context.rpc.getCluster() === 'devnet'
        ? 'https://devnet.bundlr.network'
        : 'https://node1.bundlr.network';
    const address = this.options?.address ?? defaultAddress;
    const options = {
      timeout: this.options.timeout,
      providerUrl: this.options.providerUrl,
    };

    const payer: Signer = this.options.payer ?? this.context.payer;

    // If in node use node bundlr, else use web bundlr.
    const isNode =
      // eslint-disable-next-line no-prototype-builtins
      typeof window === 'undefined' || window.process?.hasOwnProperty('type');

    let bundlr;
    if (isNode && isKeypairSigner(payer))
      bundlr = await this.initNodeBundlr(address, currency, payer, options);
    else {
      bundlr = await this.initWebBundlr(address, currency, payer, options);
    }

    try {
      // Check for valid bundlr node.
      await bundlr.utils.getBundlerAddress(currency);
    } catch (error) {
      throw new FailedToConnectToBundlrAddressError(address, error as Error);
    }

    return bundlr;
  }

  async initNodeBundlr(
    address: string,
    currency: string,
    keypair: Keypair,
    options: any
  ): Promise<NodeBundlr> {
    const bPackage = _removeDoubleDefault(
      await import('@bundlr-network/client')
    );
    // eslint-disable-next-line new-cap
    return new bPackage.default(address, currency, keypair.secretKey, options);
  }

  async initWebBundlr(
    address: string,
    currency: string,
    payer: Signer,
    options: any
  ): Promise<WebBundlr> {
    const wallet: BundlrWalletAdapter = {
      publicKey: toWeb3JsPublicKey(payer.publicKey),
      signMessage: (message: Uint8Array) => payer.signMessage(message),
      signTransaction: async (web3JsTransaction: Web3JsTransaction) =>
        toWeb3JsLegacyTransaction(
          await payer.signTransaction(
            fromWeb3JsLegacyTransaction(web3JsTransaction)
          )
        ),
      signAllTransactions: async (web3JsTransactions: Web3JsTransaction[]) => {
        const transactions = web3JsTransactions.map(
          fromWeb3JsLegacyTransaction
        );
        const signedTransactions = await payer.signAllTransactions(
          transactions
        );
        return signedTransactions.map(toWeb3JsLegacyTransaction);
      },
      sendTransaction: async (
        web3JsTransaction: Web3JsTransaction,
        connection: Web3JsConnection,
        options: Web3JsSendOptions & { signers?: Web3JsSigner[] } = {}
      ): Promise<Web3JsTransactionSignature> => {
        const { signers: web3JsSigners = [], ...sendOptions } = options;
        const signers = web3JsSigners.map((web3JsSigner) =>
          createSignerFromKeypair(
            this.context,
            fromWeb3JsKeypair(
              Web3JsKeypair.fromSecretKey(web3JsSigner.secretKey)
            )
          )
        );

        let transaction = fromWeb3JsLegacyTransaction(web3JsTransaction);
        transaction = await signTransaction(transaction, [payer, ...signers]);

        const signature = await this.context.rpc.sendTransaction(transaction, {
          ...sendOptions,
          preflightCommitment: sendOptions.preflightCommitment as Commitment,
        });

        return base58.deserialize(signature)[0];
      },
    };

    const bPackage = _removeDoubleDefault(
      await import('@bundlr-network/client')
    );
    const bundlr = new bPackage.WebBundlr(address, currency, wallet, options);

    try {
      // Try to initiate bundlr.
      await bundlr.ready();
    } catch (error) {
      throw new FailedToInitializeBundlrError(error as Error);
    }

    return bundlr;
  }
}

export const isBundlrUploader = (
  uploader: UploaderInterface
): uploader is BundlrUploader =>
  'bundlr' in uploader &&
  'getBalance' in uploader &&
  'fund' in uploader &&
  'withdrawAll' in uploader;

const bigNumberToAmount = (bigNumber: BigNumber): SolAmount =>
  lamports(bigNumber.decimalPlaces(0).toString());

const amountToBigNumber = (amount: SolAmount): BigNumber =>
  new BigNumber(amount.basisPoints.toString());

const getGenericFileTagsWithContentType = (
  file: GenericFile
): GenericFileTag[] => {
  if (!file.contentType) {
    return file.tags;
  }

  return [{ name: 'Content-Type', value: file.contentType }, ...file.tags];
};
