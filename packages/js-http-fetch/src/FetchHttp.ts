import {
  HttpInterface,
  HttpMethod,
  HttpOptions,
  HttpResponse,
} from '@lorisleiva/js-core';
import fetch, { RequestInit } from 'node-fetch';

export class FetchHttp implements HttpInterface {
  async send<ResponseData, RequestData = any>(
    method: HttpMethod,
    url: string,
    options?: HttpOptions<RequestData>
  ): Promise<HttpResponse<ResponseData>> {
    const requestInit: RequestInit = {
      method,
      body: options?.params,
      headers: options?.headers
        ? Object.entries(options.headers).reduce(
            (acc, [name, headers]) => ({ ...acc, [name]: headers.join(', ') }),
            {} as Record<string, string>
          )
        : undefined,
      signal: options?.signal as any,
      timeout: options?.timeout,
    };

    const response = await fetch(url, requestInit);

    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers.raw(),
    };
  }
}
