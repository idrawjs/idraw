/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import fs from 'fs';
import compose from 'koa-compose';
import { minify } from 'terser';
import { packages } from './config';

async function main() {
  const tasks = [];
  packages.forEach((p) => {
    // @ts-ignore
    tasks.push(async (_ctx: any, next: any) => {
      const baseFileName = 'index.global.js';
      const targetFileName = 'index.global.min.js';
      const moduleBasePath = path.join(
        __dirname,
        '..',
        'packages',
        p.dirName,
        'dist'
      );

      console.log(
        `minify file: ${path.join(p.dirName, baseFileName)} > ${path.join(
          p.dirName,
          targetFileName
        )}`
      );
      const filePath = path.join(moduleBasePath, baseFileName);
      const targetPath = path.join(moduleBasePath, targetFileName);
      const code = fs.readFileSync(filePath, { encoding: 'utf8' });
      const options = {
        output: {
          beautify: false,
          comments: false,
          indent_level: 2,
          quote_style: 3
        }
      };
      const result = await minify(code, options);
      fs.writeFileSync(targetPath, result.code as string);
      await next();
    });
  });

  await compose(tasks)();
}

main();
