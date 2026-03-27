export async function httpRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return await fetch(input, init);
}

export async function httpPostJson<TBody>(
  input: RequestInfo | URL,
  body: TBody,
  init?: Omit<RequestInit, 'body' | 'method'>,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return await httpRequest(input, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
