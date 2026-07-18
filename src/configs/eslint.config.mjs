import playwright from 'eslint-plugin-playwright';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'src/tests/dev/dev.spec.ts'
    ],
  },
  {
    files: ['src/**/*.ts'],

    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: '../../tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { playwright },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': [
        'warn',
        {
          assertFunctionNames: ['expect'],
          assertFunctionPatterns: ['^validate', '\\.validate']

        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      'no-console': [
        'warn',
        { allow: ['error', 'warn', 'info'] }
      ],
    },
  }
]);