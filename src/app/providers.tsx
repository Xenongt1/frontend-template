import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './router';
import { loadConfig, saveConfig, type AppConfig, normalizeApiBaseUrl } from '@/core/config';
import ConfigSetupForm from '@/core/config/ConfigSetupForm';

function resolveConfig(): AppConfig | null {
  // 1. Already configured via the form (localStorage)
  const saved = loadConfig();
  if (saved) return saved;

  // 2. Env vars present — build config from them and persist so form is skipped next time
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBaseUrl) {
    const config: AppConfig = {
      apiBaseUrl: normalizeApiBaseUrl(apiBaseUrl),
      environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) ?? 'development',
      tenantId: (import.meta.env.VITE_TENANT_ID as string) ?? '',
      wsUrl: (import.meta.env.VITE_WS_URL as string) ?? '',
    };
    saveConfig(config);
    return config;
  }

  // 3. Nothing set — show the reminder form
  return null;
}

export const Providers: React.FC<{ children?: React.ReactNode }> = () => {
  const [config, setConfig] = useState<AppConfig | null>(() => resolveConfig());

  if (!config) {
    return <ConfigSetupForm onComplete={setConfig} />;
  }

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};
