import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'

const repoRoot = __dirname

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@react-spring\/mock-raf$/,
        replacement: path.join(repoRoot, 'packages/mock-raf/index.js'),
      },
      {
        find: /^@react-spring\/parallax$/,
        replacement: path.join(repoRoot, 'packages/parallax/src/index.tsx'),
      },
      {
        find: /^@react-spring\/(web|native|three|konva|zdog)$/,
        replacement: path.join(repoRoot, 'targets/$1/src/index.ts'),
      },
      {
        find: /^@react-spring\/(.*)$/,
        replacement: path.join(repoRoot, 'packages/$1/src/index.ts'),
      },
      {
        find: /^react$/,
        replacement: path.join(repoRoot, 'node_modules/react'),
      },
    ],
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportOnFailure: true,
      include: [
        'packages/animated/src/*.{ts,tsx}',
        'packages/core/src/*.{ts,tsx}',
        'packages/rafz/src/*.{ts,tsx}',
        'packages/shared/src/*.{ts,tsx}',
        'targets/web/src/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.native.{ts,tsx}',
        '**/__snapshots__/**',
        '**/dist/**',
        '**/node_modules/**',
        'demo/**',
        'docs/**',
        'targets/{native,three,konva,zdog}/**',
        'packages/{eslint-config,mock-raf,parallax,react-spring,types}/**',
        'tests/**',
      ],
      thresholds: {
        statements: 80,
        branches: 74,
        functions: 71,
        lines: 82,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'packages/**/src/**/*.test.{ts,tsx}',
            'targets/**/src/**/*.test.{ts,tsx}',
          ],
          exclude: [
            '**/*.native.{ts,tsx}',
            '**/node_modules/**',
            '**/dist/**',
            '**/__snapshots__/**',
          ],
          setupFiles: ['./packages/core/test/setup.ts'],
          fakeTimers: {
            toFake: [
              'setTimeout',
              'clearTimeout',
              'setInterval',
              'clearInterval',
              'Date',
              'queueMicrotask',
              'performance',
            ],
          },
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.spec.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'types',
          include: ['packages/**/src/**/*.test-d.{ts,tsx}'],
          typecheck: {
            enabled: true,
            tsconfig: './tsconfig.json',
            include: ['packages/**/src/**/*.test-d.{ts,tsx}'],
          },
        },
      },
    ],
  },
})
