const path = require('path');
const fs = require('fs');
const compose = require('koa-compose')
const { minify } = require('terser');
const { packages } = require('./config');

async function main() {
  const tasks = [];
  packages.forEach((p) => {
    tasks.push(async (ctx, next) => {
      const baseFileName = 'index.global.js';
      const targetFileName = 'index.global.min.js';
      const moduleBasePath = path.join(__dirname, '..', 'packages', p.dirName, 'dist');

      console.log(`minify file: ${path.join(p.dirName, baseFileName)} > ${path.join(p.dirName, targetFileName)}`)
      const filePath = path.join(moduleBasePath, baseFileName);
      const targetPath = path.join(moduleBasePath, targetFileName);
      const code = fs.readFileSync(filePath, { encoding: 'utf8' });
      const options = {
        output: {
          beautify: false,
          comments: false,
          indent_level: 2,
          quote_style: 3,
        },
      };
      const result = await minify(code, options);
      fs.writeFileSync(targetPath, result.code);
      await next();
    })
  });

  await compose(tasks)();
}

main();