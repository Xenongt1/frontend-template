import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const DEFAULT_API_BASE_URL = '';

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const url = configuredUrl ?? DEFAULT_API_BASE_URL;
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { signal?: AbortSignal } = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;

  const config: AxiosRequestConfig = {
    method,
    url: `${getApiBaseUrl()}${path}`,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
    signal,
    ...(body !== undefined && {
      data: typeof body === 'string' ? JSON.parse(body) : body,
    }),
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const payload = err.response?.data as Record<string, unknown> | undefined;
      const validationErrors = Array.isArray(payload?.errors)
        ? (payload.errors as string[])
        : undefined;
      throw new ApiError(
        (payload?.message as string) ?? err.message ?? 'Request failed',
        err.response?.status ?? 0,
        validationErrors,
      );
    }
    throw err;
  }
}
