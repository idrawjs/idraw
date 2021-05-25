const jimp = require('jimp');
const path = require('path');
const { delay } = require('./util/time');
const { createScreenshot } = require('./util/screen');
const { pageList } = require('./screen.config');

const snapshotDir = path.join(__dirname, '..', '__tests__', 'snapshot');

main();

async function main() {
  const middlewares = [];
  pageList.forEach((p) => {
    middlewares.push(async (ctx = {}, next) => {
      const { page, port } = ctx;
      await page.setViewport( { width: p.w, height: p.h } );
      const pageUrl = `http://127.0.0.1:${port}/packages/${p.path || ''}`;
      await page.goto(pageUrl);
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
  picPath = picPath.replace(/\.html$/, '.jpg');
  return picPath;
}

