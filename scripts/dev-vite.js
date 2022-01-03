const { AutoComplete } = require('enquirer');
const chalk = require('chalk');
const { createServer, defineConfig } = require('vite');
const { resolvePackagePath } = require('./util/project');
const { packages } = require('./config');

dev();

async function dev() {
  const pkgName = await inputPackageName();
  const viteConfig = getViteConfig(pkgName);
  const server = await createServer(viteConfig)
  await server.listen()
  server.printUrls();
  const { port, host = '127.0.0.1' } = server.config?.server || {}
  console.log(
    `Open: ` + 
    chalk.green(
      `http://${host}:${port}/index.html`
    )
  );
}

function getViteConfig(pkgName) {
  const viteConfig = defineConfig({
    configFile: false,
    root: resolvePackagePath(pkgName),
    publicDir: resolvePackagePath(pkgName, 'dev'),
    server: {
      port: 8080,
      host: '127.0.0.1',
    },
    plugins: [],
    esbuild: {
      include: [
        /\.ts$/,
        /\.js$/,
      ],
      exclude: [
        /\.html$/
      ]
    },
  });
  return viteConfig;
}

async function inputPackageName() {
  choices = packages.map((pkg) => {
    return pkg.dirName;
  })
  const prompt = new AutoComplete({
    name: 'Package Name',
    message: 'Pick your dev package',
    limit: choices.length,
    initial: 0,
    choices: choices
  });
  const pkgName = await prompt.run();
  return pkgName;
}
