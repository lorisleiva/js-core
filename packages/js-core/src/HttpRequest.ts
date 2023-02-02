import type { GenericAbortSignal } from './GenericAbortSignal';
import type { HttpHeaderValue, HttpRequestHeaders } from './HttpHeaders';

type Milliseconds = number;

export type HttpRequest<D = any> = {
  method: HttpMethod;
  url: string;
  data: D;
  headers: HttpRequestHeaders;
  maxRedirects?: number;
  timeout?: Milliseconds;
  signal?: GenericAbortSignal;
  throwOnError?: boolean; // ?
};

export const request = () =>
  new HttpRequestBuilder<undefined>({
    method: 'get',
    data: undefined,
    headers: {},
    url: '',
  });

export class HttpRequestBuilder<D> implements HttpRequest<D> {
  protected readonly request: HttpRequest<D>;

  constructor(request: HttpRequest<D>) {
    this.request = request;
  }

  asJson() {
    return this.contentType('application/json');
  }

  asForm() {
    return this.contentType('application/x-www-form-urlencoded');
  }

  accept(contentType: string) {
    return this.withHeader('accept', contentType);
  }

  contentType(contentType: string) {
    return this.withHeader('content-type', contentType);
  }

  userAgent(userAgent: string) {
    return this.withHeader('user-agent', userAgent);
  }

  withToken(token: string, type: string = 'Bearer') {
    return this.withHeader('authorization', `${type} ${token}`);
  }

  withHeader(key: string, value: HttpHeaderValue) {
    return this.withHeaders({ [key]: value });
  }

  withHeaders(headers: HttpRequestHeaders) {
    return new HttpRequestBuilder<D>({
      ...this.request,
      headers: { ...this.request.headers, ...headers },
    });
  }

  dontFollowRedirects() {
    return this.followRedirects(0);
  }

  followRedirects(maxRedirects: number = 20) {
    return new HttpRequestBuilder<D>({ ...this.request, maxRedirects });
  }

  noTimeout() {
    return this.withTimeout(0);
  }

  withTimeout(timeout: Milliseconds) {
    return new HttpRequestBuilder<D>({ ...this.request, timeout });
  }

  withAbortSignal(signal: GenericAbortSignal) {
    return new HttpRequestBuilder<D>({ ...this.request, signal });
  }

  withEndpoint(method: HttpMethod, url: string) {
    return new HttpRequestBuilder<D>({ ...this.request, method, url });
  }

  withParams(
    params: string | URLSearchParams | string[][] | Record<string, string>
  ) {
    const url = new URL(this.request.url);
    const newSearch = new URLSearchParams(params);
    const search = new URLSearchParams(url.searchParams);
    [...newSearch.entries()].forEach(([key, val]) => {
      search.append(key, val);
    });
    url.search = search.toString();
    return new HttpRequestBuilder<D>({ ...this.request, url: url.toString() });
  }

  withData<T>(data: T) {
    return new HttpRequestBuilder<T>({ ...this.request, data });
  }

  get(url: string) {
    return this.withEndpoint('get', url);
  }

  post(url: string) {
    return this.withEndpoint('post', url);
  }

  put(url: string) {
    return this.withEndpoint('put', url);
  }

  patch(url: string) {
    return this.withEndpoint('patch', url);
  }

  delete(url: string) {
    return this.withEndpoint('delete', url);
  }

  get method(): HttpMethod {
    return this.request.method;
  }

  get url(): string {
    return this.request.url;
  }

  get data(): D {
    return this.request.data;
  }

  get headers(): HttpRequestHeaders {
    return this.request.headers;
  }

  get maxRedirects(): number | undefined {
    return this.request.maxRedirects;
  }

  get timeout(): Milliseconds | undefined {
    return this.request.timeout;
  }

  get signal(): GenericAbortSignal | undefined {
    return this.request.signal;
  }
}

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
