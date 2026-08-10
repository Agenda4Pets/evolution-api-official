// Mirrors evolution-go/pkg/core/transport.go
// HTTP transport for licensing server calls. Signed = HMAC-SHA256(body, apiKey).

import axios, { AxiosResponse } from 'axios';
import { createHmac } from 'crypto';

import { LICENSING_ENABLED } from './config';
import { resolveEndpoint } from './endpoint';

const httpClient = axios.create({ timeout: 10_000 });

/**
 * Hard stop for outbound licensing traffic when the subsystem is disabled.
 * Defence in depth: runtime.ts already short-circuits before reaching here, so
 * this only fires if an upstream merge introduces a new call site.
 */
function assertLicensingEnabled(path: string): void {
  if (!LICENSING_ENABLED) {
    throw new Error(`licensing disabled — refusing outbound call to ${path}`);
  }
}

export function signPayload(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export async function postSigned<T = unknown>(
  path: string,
  payload: unknown,
  apiKey: string,
): Promise<AxiosResponse<T>> {
  assertLicensingEnabled(path);
  const body = JSON.stringify(payload);
  return httpClient.post<T>(resolveEndpoint() + path, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Signature': signPayload(body, apiKey),
    },
    // We surface non-2xx as throws — same as the Go path that checks resp.StatusCode.
  });
}

export async function postUnsigned<T = unknown>(path: string, payload: unknown): Promise<AxiosResponse<T>> {
  assertLicensingEnabled(path);
  return httpClient.post<T>(resolveEndpoint() + path, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getUnsigned<T = unknown>(path: string): Promise<AxiosResponse<T>> {
  assertLicensingEnabled(path);
  return httpClient.get<T>(resolveEndpoint() + path);
}

export function readErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    const msg = data?.message ?? data?.error;
    if (msg) return `${String(msg).toLowerCase()} (HTTP ${err.response?.status ?? 'n/a'})`;
    if (err.response) return `HTTP ${err.response.status}`;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'unknown error';
}
