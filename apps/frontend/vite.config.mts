/// <reference types='vitest' />
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname, '../..'), '');
  const servicePorts = {
    auth: Number(env.AUTH_PORT || 3001),
    products: Number(env.PRODUCTS_PORT || 3002),
    users: Number(env.USERS_PORT || 3003),
    shipping: Number(env.SHIPPING_PORT || 3004),
    invoices: Number(env.INVOICES_PORT || 3005),
  };

  return ({
  root: import.meta.dirname,
  envDir: '../..',
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4201,
    host: 'localhost',
  },
  preview: {
    port: 4301,
    host: 'localhost',
  },
  plugins: [react(), tailwindcss()],
  define: {
    __SERVICE_PORTS__: JSON.stringify(servicePorts),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'frontend',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
  });
});
