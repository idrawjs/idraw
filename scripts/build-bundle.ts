import { build } from 'vite';
import type { InlineConfig } from 'vite';
import { joinPackagePath } from './util/project';
import { packages } from './config';

async function buildBundle(opts: { dirName: string; globalName: string }) {
  const { dirName, globalName } = opts;
  const filePath = joinPackagePath(dirName, 'src', 'index.ts');
  const distDir = joinPackagePath(dirName, 'dist');
  const config: InlineConfig = {
    plugins: [],
    build: {
      minify: false,
      emptyOutDir: false,
      lib: {
        name: globalName,
        entry: filePath,
        formats: ['iife'],
        fileName: () => {
          return 'index.global.js';
        }
      },
      outDir: distDir
    }
  };
  console.log(`Start build bundle [${dirName}] ...`);
  await build(config);
  console.log(`Build bundle [${dirName}] successfully!`);
}

async function run() {
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    await buildBundle(pkg);
  }
}

run();
