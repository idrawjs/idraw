import { fileURLToPath } from 'node:url';
import path from 'node:path';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

const packages = [
  {
    dirName: 'util',
    globalName: 'iDrawUtil'
  },
  {
    dirName: 'board',
    globalName: 'iDrawBoard'
  },
  {
    dirName: 'renderer',
    globalName: 'iDrawRenderer'
  },
  {
    dirName: 'core',
    globalName: 'iDrawCore'
  },
  {
    dirName: 'idraw',
    globalName: 'iDraw'
  }
];

const getPath = (...args) => {
  return path.join(rootDir, ...args);
};

export default [
  ...packages.map((pkg) => {
    return {
      input: getPath('packages', pkg.dirName, 'src', 'index.ts'),
      output: {
        format: 'iife',
        name: pkg.globalName,
        file: getPath('packages', pkg.dirName, 'dist', 'index.global.js'),
        exports: 'named'
      },
      plugins: [
        esbuild({
          target: 'es2015'
        }),
        json()
      ],
      external: [],
      treeshake: false
    };
  }),
  ...packages.map((pkg) => {
    return {
      input: getPath('packages', pkg.dirName, 'src', 'index.ts'),
      output: {
        file: getPath('packages', pkg.dirName, 'dist', 'index.global.d.js'),
        format: 'es'
      },
      plugins: [dts()],
      external: [],
      treeshake: false
    };
  })
];
