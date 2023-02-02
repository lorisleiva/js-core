import { InterfaceImplementationMissingError } from './errors';
import type { GenericAbortSignal } from './GenericAbortSignal';

export interface HttpInterface {
  send: <ResponseData, RequestData = any>(
    request: HttpRequest<RequestData>
  ) => Promise<HttpResponse<ResponseData>>;
}

type Milliseconds = number;

export type HttpRequest<D = any> = {
  method: HttpMethod;
  url: string;
  data?: D;
  params?: object | URLSearchParams;
  headers?: HttpRequestHeaders;
  timeout?: Milliseconds;
  signal?: GenericAbortSignal;
  throwOnError?: boolean;
};

export type HttpResponse<D = any> = {
  data: D;
  body: string;
  ok: boolean;
  status: number;
  statusText: string;
  headers: HttpResponseHeaders;
};

export type HttpHeaderValue = string | string[];

export type HttpHeaderContentTypeValue =
  | HttpHeaderValue
  | 'text/html'
  | 'text/plain'
  | 'multipart/form-data'
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'application/octet-stream';

export type HttpHeaders = Record<string, HttpHeaderValue>;

export type HttpRequestHeaders = HttpHeaders & {
  Accept?: HttpHeaderValue;
  Authorization?: HttpHeaderValue;
  'Content-Encoding'?: HttpHeaderValue;
  'Content-Length'?: HttpHeaderValue;
  'Content-Type'?: HttpHeaderContentTypeValue;
  'User-Agent'?: HttpHeaderValue;
};

export type HttpResponseHeaders = HttpHeaders & {
  Server?: HttpHeaderValue;
  'Cache-Control'?: HttpHeaderValue;
  'Content-Encoding'?: HttpHeaderValue;
  'Content-Length'?: HttpHeaderValue;
  'Content-Type'?: HttpHeaderContentTypeValue;
};

export type HttpMethod =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export class NullHttp implements HttpInterface {
  send<ResponseData>(): Promise<HttpResponse<ResponseData>> {
    throw new InterfaceImplementationMissingError('HttpInterface', 'http');
  }
}
