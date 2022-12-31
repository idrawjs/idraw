import http from 'http';
import path from 'path';
import puppeteer from 'puppeteer';
import serveHandler from 'serve-handler';
import compose from 'koa-compose';
import { delay } from './time';

const port = 3001;
const width = 600;
const height = 600;

module.exports = {
  createScreenshotBuffer,
  createScreenshot,
  width,
  height
};

async function createScreenshotBuffer(pagePath) {
  const middlewares = [];
  let buf;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  middlewares.push(async (ctx: any) => {
    const { page, port } = ctx as { page: any; port: number };
    await page.setViewport({ width: width, height: height });
    const pageUrl = `http://127.0.0.1:${port}/${pagePath || ''}`;
    await page.goto(pageUrl);
    await delay(1000 * 2);
    buf = await page.screenshot();
  });
  await createScreenshot(middlewares, {
    baseDir: path.join(__dirname, '..', '..')
  });
  return buf;
}

async function createScreenshot(middlewares, opts: any = {}): Promise<void> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) =>
      serveHandler(req, res, {
        public: opts.baseDir
      })
    );
    server.listen(port, async () => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await compose(middlewares)({ page, port });
        await browser.close();
        server.close();
        resolve();
      } catch (err) {
        server.close();
        console.error(err);
        process.exit(-1);
      }
    });
    server.on('SIGINT', () => process.exit(1));
  });
}
