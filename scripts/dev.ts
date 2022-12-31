/* eslint-disable @typescript-eslint/ban-ts-comment */
import AutoComplete from 'enquirer/lib/prompts/autocomplete';
import chalk from 'chalk';
import { createServer } from 'vite';
import type { UserConfig } from 'vite';
import { joinPackagePath } from './util/project';
import { packages } from './config';

dev();

async function dev() {
  const pkgName = await inputPackageName();
  const viteConfig = getViteConfig(pkgName);
  const server = await createServer({
    configFile: false,
    ...viteConfig
  });
  await server.listen();
  server.printUrls();
  const { port, host = '127.0.0.1' } = server.config?.server || {};
  console.log(`Open: ` + chalk.green(`http://${host}:${port}/dev/index.html`));
}

function getViteConfig(pkgName: string): UserConfig {
  const viteConfig: UserConfig = {
    root: joinPackagePath(pkgName),
    publicDir: joinPackagePath(pkgName, 'demo', 'public'),
    server: {
      port: 8080,
      host: '127.0.0.1'
    },
    plugins: [],
    esbuild: {
      include: [/\.ts$/, /\.js$/],
      exclude: [/\.html$/]
    },
    optimizeDeps: {}
  };
  return viteConfig;
}

async function inputPackageName() {
  const choices = packages.map((pkg) => {
    return pkg.dirName;
  });
  const prompt = new AutoComplete({
    name: 'Package Name',
    message: 'Pick your dev package',
    limit: choices.length,
    initial: 0,
    choices: choices
  });
  // @ts-ignore
  const pkgName = await prompt.run();
  return pkgName;
}
