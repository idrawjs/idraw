const execa = require('execa');
const process = require('process');


async function main() {
  
  await execa('rollup',
    [
      '-w',
      '-c',
      './scripts/rollup.config.js',
    ], { stdio: 'inherit' }
  )
}

main();