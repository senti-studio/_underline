import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      enabled: true,
      reportsDirectory: './html/coverage',
      include: ['src'],
      thresholds: {
        autoUpdate: true,
      },
    },
    reporters: ['html'],
    environment: 'jsdom',
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
})
