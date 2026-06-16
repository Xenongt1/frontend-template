import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { normalizeApiBaseUrl } from '@/core/config';

// Empty by default — the FE emits relative URLs (`/api/inventory/items` etc.)
// that nginx proxies to the backend on the same origin in prod, and the Vite
// dev proxy does the same locally. Override via VITE_API_BASE_URL only when
// the FE genuinely needs to hit a different origin (ngrok, cross-origin dev).
const DEFAULT_API_BASE_URL = '';

export class ApiError extends Error {
  status: number;
  /** Validation messages — backend returns a string[] under `errors` (see GlobalExceptionHandler). */
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  return normalizeApiBaseUrl(configuredUrl ?? DEFAULT_API_BASE_URL);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const token = localStorage.getItem('chainpilot_access_token');

  const config: AxiosRequestConfig = {
    method,
    url: `${getApiBaseUrl()}${path}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    ...(body !== undefined && {
      data: typeof body === 'string' ? JSON.parse(body) : body,
    }),
  };

  try {
    const response = await axios.request<T>(config);

    // Some paths on the testing ALB have no backend wired behind them, so the
    // load balancer falls through to serving the FE's index.html with a 200
    // status. Without this guard, downstream code crashes later on
    // `response.data.map` etc. — surface a real gateway error instead.
    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : '';
    if (typeof response.data === 'string' || !contentType.toLowerCase().includes('application/json')) {
      throw new ApiError('Bad Gateway: backend returned a non-JSON response', 502);
    }

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const payload = err.response?.data;
      const validationErrors = Array.isArray(payload?.errors)
        ? (payload.errors as string[])
        : undefined;
      throw new ApiError(
        payload?.message ?? err.message ?? 'Request failed',
        err.response?.status ?? 0,
        validationErrors,
      );
    }
    throw err;
  }
}
