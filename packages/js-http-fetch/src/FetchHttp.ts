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
      signal: options?.signal as any,
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
