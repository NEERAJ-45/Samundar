import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/lib/__tests__/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: ['@excalidraw/excalidraw'],
      },
    },
  },
});
