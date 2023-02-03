// eslint-disable-next-line import/no-named-default
import type { default as NodeBundlr, WebBundlr } from '@bundlr-network/client';
import {
  Context,
  createGenericFileFromJson,
  GenericFile,
  GenericFileTag,
  Keypair,
  lamports,
  Signer,
  SolAmount,
  UploaderInterface,
} from '@lorisleiva/js-core';
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
  fromWeb3JsTransaction,
  toWeb3JsPublicKey,
  toWeb3JsTransaction,
} from 'packages/js-web3js-adapters/dist/types';
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

export type BundlrOptions = {
  address?: string;
  timeout?: number;
  providerUrl?: string;
  priceMultiplier?: number;
  identity?: Signer;
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
  protected context: Pick<Context, 'rpc' | 'identity'>;

  protected options: BundlrOptions;

  protected _bundlr: WebBundlr | NodeBundlr | null = null;

  constructor(
    context: Pick<Context, 'rpc' | 'identity'>,
    options: BundlrOptions = {}
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
    if (!this._bundlr) {
      this._bundlr = await this.initBundlr();
    }

    return this._bundlr;
  }

  async initBundlr(): Promise<WebBundlr | NodeBundlr> {
    const currency = 'solana';
    const address = this.options?.address ?? 'https://node1.bundlr.network';
    const options = {
      timeout: this.options.timeout,
      providerUrl: this.options.providerUrl,
    };

    const identity: Signer = this.options.identity ?? this.context.identity;

    // If in node use node bundlr, else use web bundlr.
    const isNode =
      // eslint-disable-next-line no-prototype-builtins
      typeof window === 'undefined' || window.process?.hasOwnProperty('type');
    let bundlr;
    if (isNode && isKeypairSigner(identity))
      bundlr = await this.initNodeBundlr(address, currency, identity, options);
    else {
      let identitySigner: IdentitySigner;
      if (isIdentitySigner(identity)) identitySigner = identity;
      else
        identitySigner = new KeypairIdentityDriver(
          Web3JsKeypair.fromSecretKey((identity as KeypairSigner).secretKey)
        );

      bundlr = await this.initWebBundlr(
        address,
        currency,
        identitySigner,
        options
      );
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
    identity: Signer,
    options: any
  ): Promise<WebBundlr> {
    const wallet: BundlrWalletAdapter = {
      publicKey: toWeb3JsPublicKey(identity.publicKey),
      signMessage: (message: Uint8Array) => identity.signMessage(message),
      signTransaction: async (transaction: Web3JsTransaction) =>
        toWeb3JsTransaction(
          await identity.signTransaction(fromWeb3JsTransaction(transaction))
        ),
      signAllTransactions: (transactions: Web3JsTransaction[]) =>
        identity.signAllTransactions(transactions),
      sendTransaction: (
        transaction: Web3JsTransaction,
        connection: Web3JsConnection,
        options: Web3JsSendOptions & { signers?: Web3JsSigner[] } = {}
      ): Promise<Web3JsTransactionSignature> => {
        const { signers = [], ...sendOptions } = options;

        return this.context.rpc.sendTransaction(transaction, sendOptions, [
          identity,
          ...signers,
        ]);
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
