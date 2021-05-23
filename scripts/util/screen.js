const path = require('path');
const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const serveHandler = require('serve-handler');
const compose = require('koa-compose');
const { delay } = require('./time');

const port = 3001;
const width = 600;
const height = 600;

module.exports = {
  createScreenshotBuffer,
  createScreenshot,
  width,
  height,
}


async function createScreenshotBuffer(pagePath) {
  const middlewares = [];
  let buf;
  middlewares.push(async (ctx = {}, next) => {
    const { page, port } = ctx;
    await page.setViewport( { width: width, height: height } );
    const pageUrl = `http://127.0.0.1:${port}/${pagePath || ''}`;
    await page.goto(pageUrl);
    await delay(1000 * 2);
    buf = await page.screenshot();
  });
  await createScreenshot(middlewares, { baseDir: path.join(__dirname, '..', '..') });
  return buf;
}


async function createScreenshot(middlewares, opts = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => serveHandler(req, res, {
      public: opts.baseDir,
    }));
    server.listen(port, async () => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await compose(middlewares)({ page, port })
        await browser.close();
        server.close();
        resolve();
      } catch (err) {
        server.close();
        console.error(err);
        process.exit(-1);
      }
    });
    server.on('SIGINT', () => process.exit(1) );
  })
}


