const execa = require('execa');

async function main() {
  
  await execa( 'rollup',
    [
      '-w',
      '-c',
      './scripts/rollup.config.js'
    ], { stdio: 'inherit' }
  )
}

main();