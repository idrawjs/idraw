import jimp from 'jimp';
import path from 'path';
import { delay } from './util/time';
import { createScreenshot } from './util/screen';
import { removeFullDir } from './util/file';
import { pageList } from './screen.config';

const snapshotDir = path.join(__dirname, '..', '__tests__', 'snapshot');

main();

async function main() {
  removeFullDir(snapshotDir);
  const middlewares = [];
  pageList.forEach((p, i) => {
    middlewares.push(async (ctx = {}, next) => {
      const { page, port } = ctx as any;
      console.log(`[${i + 1}/${pageList.length}] Screen: ${p.path}`);

      await page.setViewport({ width: p.w, height: p.h });
      const pageUrl = `http://127.0.0.1:${port}/examples/${p.path || ''}`;
      const result = await page.goto(pageUrl);
      if (result.status() === 404) {
        console.error(`404 Not Found: ${pageUrl}`);
        throw Error('404 status code found in result');
      }
      await delay(p.delay || 100);
      const buf = await page.screenshot();
      (await jimp.read(buf)).scale(1).quality(100).write(createPicPath(p.path));
      await next();
    });
  });
  await createScreenshot(middlewares, { baseDir: path.join(__dirname, '..') });
}

function createPicPath(pagePath) {
  let picPath = path.join(snapshotDir, pagePath);
  picPath = picPath + '.jpg'; // picPath.replace(/\.html$/, '.jpg');
  return picPath;
}
