import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local-dev proxy. The deployed FE sits behind nginx which forwards every
// backend prefix on the same origin, so production never hits CORS. Locally
// the dev server proxies the same prefixes so the browser sees same-origin
// too — the proxy target defaults to the test ALB but any developer can
// override by setting VITE_DEV_PROXY_TARGET in their own .env.local.
//
// To use: leave VITE_API_BASE_URL empty so the FE emits relative paths
// (/api/roles, /api/inventory/items, /grades) which the proxy rules below
// pick up.
const DEFAULT_PROXY_TARGET =
  'http://chainpilot-test-alb-1409066991.eu-west-1.elb.amazonaws.com:8080'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_DEV_PROXY_TARGET || DEFAULT_PROXY_TARGET
  const proxy = { target, changeOrigin: true }

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      viteReact(),
    ],
    server: {
      port: 4030,
      proxy: {
        '/api': proxy,
        '/grades': proxy,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
