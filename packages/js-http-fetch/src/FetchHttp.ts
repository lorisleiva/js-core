import { HttpInterface, HttpRequest, HttpResponse } from '@lorisleiva/js-core';
import fetch, { BodyInit, RequestInit } from 'node-fetch';

export class FetchHttp implements HttpInterface {
  async send<ResponseData, RequestData = any>(
    request: HttpRequest<RequestData>
  ): Promise<HttpResponse<ResponseData>> {
    const requestInit: RequestInit = {
      method: request.method,
      body: request.data as BodyInit | undefined,
      headers: request.headers
        ? Object.entries(request.headers).reduce(
            (acc, [name, headers]) => ({
              ...acc,
              [name]: Array.isArray(headers) ? headers.join(', ') : headers,
            }),
            {} as Record<string, string>
          )
        : undefined,
      signal: request.signal as any,
      timeout: request.timeout,
    };

    const response = await fetch(request.url, requestInit);
    const isJsonResponse =
      response.headers.get('content-type')?.includes('application/json') ??
      false;

    return {
      data: isJsonResponse ? await response.json() : await response.text(),
      status: response.status,
      statusText: response.statusText,
      headers: { ...response.headers.raw() },
    };
  }
}
