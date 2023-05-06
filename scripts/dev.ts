/* eslint-disable @typescript-eslint/ban-ts-comment */
import chalk from 'chalk';
import { createServer } from 'vite';
import pluginReact from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';
import { joinPackagePath } from './util/project';

dev();

async function dev() {
  const viteConfig = getViteConfig();
  const server = await createServer({
    configFile: false,
    ...viteConfig
  });
  await server.listen();
  server.printUrls();
  const { port, host = '127.0.0.1' } = server.config?.server || {};
  console.log(`Open: ` + chalk.green(`http://${host}:${port}/dev/index.html`));
}

function getViteConfig(): UserConfig {
  const pkgName = 'lab';
  const viteConfig: UserConfig = {
    root: joinPackagePath(pkgName),
    publicDir: joinPackagePath(pkgName, 'demo', 'public'),
    server: {
      port: 8080,
      host: '127.0.0.1'
    },
    plugins: [pluginReact()],
    resolve: {
      alias: {
        '@idraw/types': joinPackagePath('types', 'src', 'index.ts'),
        '@idraw/util': joinPackagePath('util', 'src', 'index.ts'),
        '@idraw/renderer': joinPackagePath('renderer', 'src', 'index.ts'),
        '@idraw/board': joinPackagePath('board', 'src', 'index.ts'),
        '@idraw/core': joinPackagePath('core', 'src', 'index.ts')
      }
    },
    esbuild: {
      include: [/\.(ts|tsx|js|jsx)$/],
      exclude: [/\.html$/]
    },
    optimizeDeps: {}
  };
  return viteConfig;
}
