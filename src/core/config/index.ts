export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  tenantId: string;
  wsUrl: string;
}

const STORAGE_KEY = 'chainpilot_config';

/** Removes legacy `/v1` API version segments from configured base URLs. */
export function normalizeApiBaseUrl(url: string): string {
  let normalized = url.trim();
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  normalized = normalized.replace(/\/api\/v1$/i, '/api');
  normalized = normalized.replace(/\/v1$/i, '');

  return normalized;
}

export function loadConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    if (!parsed.apiBaseUrl || !parsed.environment || !parsed.tenantId) return null;
    return {
      ...parsed,
      apiBaseUrl: normalizeApiBaseUrl(parsed.apiBaseUrl),
    } as AppConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: AppConfig): void {
  const { apiBaseUrl: _, ...rest } = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
