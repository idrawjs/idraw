const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const chalk = require('chalk');
// const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const { packages } = require('./config');
const pkgNames = packages.map((pkg) => {
  return pkg.dirName
})

async function main() {

  if (process.env.BUILD_MODE === 'reset') {
    pkgNames.forEach(async (name) => {
      const target = name;
      const pkgDir = path.resolve(`packages/${target}`);
      // const pkg = require(`${pkgDir}/package.json`)
      await fs.remove(`${pkgDir}/dist`);
    });
  }

  await 
  execa('rollup', [ '-c', './scripts/rollup.config.js', ], { stdio: 'inherit' });

}

main();