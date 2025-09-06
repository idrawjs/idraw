import globals from 'globals';
import pluginJs from '@eslint/js';
import tsESLint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginNode from 'eslint-plugin-n';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tsESLint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  {
    ...eslintPluginNode.configs['flat/recommended-script'],
    files: ['scripts/**/*.ts', 'babel.config.js', 'jest.*.js', 'jest.*.*.js'],
    rules: {
      // 'no-console': 'error'
    },
  },
  {
    files: [
      'packages/types/src/**/*.ts',
      'packages/util/src/**/*.ts',
      'packages/renderer/src/**/*.ts',
      'packages/core/src/**/*.ts',
      'packages/idraw/src/**/*.ts',
    ],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {},
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    // ignores: ['node_modules'],
    rules: {
      semi: 'error',
      'no-console': 'error',
      '@typescript-eslint/rule-name': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-unnecessary-type-constraint': 0,
    },
  },
];
