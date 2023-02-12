import '../../../../__tests__/polyfill/image';
import { loadHTML, loadImage, loadSVG } from '../../src/lib/loader';
import { parseHTMLToDataURL, parseSVGToDataURL } from '../../src/lib/parser';

describe('@idraw/util: lib/loader', () => {
  test('loadHTML', async () => {
    const html = `
    <style>
    .btn-box {
      margin: 10px 0;
    }
    .btn {
      line-height: 1.5715;
      position: relative;
      display: inline-block;
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      background-image: none;
      border: 1px solid transparent;
      box-shadow: 0 2px #00000004;
      cursor: pointer;
      user-select: none;
      height: 32px;
      padding: 4px 15px;
      font-size: 14px;
      border-radius: 2px;
      color: #000000d9;
      background: #fff;
      border-color: #d9d9d9;
    }
    .btn-primary {
      color: #fff;
      background: #1890ff;
      border-color: #1890ff;
      text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
      box-shadow: 0 2px #0000000b;
    }
    </style>
    <div>
      <div class="btn-box" style="margin-top: 0;">
        <button class="btn" >
          <span>Button</span>
        </button>
      </div>

      <div class="btn-box">
        <button class="btn btn-primary">
          <span>Button Primary</span>
        </button> 
      </div>
    </div>
    `;
    const opts = {
      width: 120,
      height: 80
    };
    const result = await loadHTML(html, opts);
    const expectDataURL = await parseHTMLToDataURL(html, opts);
    const expectImage = await loadImage(expectDataURL);
    expect(result.src).toStrictEqual(expectImage.src);
  });

  test('loadSVG', async () => {
    const svg = `<svg t="1622524780663" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8365" width="200" height="200"><path d="M881 442.4H519.7v148.5h206.4c-8.9 48-35.9 88.6-76.6 115.8-34.4 23-78.3 36.6-129.9 36.6-99.9 0-184.4-67.5-214.6-158.2-7.6-23-12-47.6-12-72.9s4.4-49.9 12-72.9c30.3-90.6 114.8-158.1 214.7-158.1 56.3 0 106.8 19.4 146.6 57.4l110-110.1c-66.5-62-153.2-100-256.6-100-149.9 0-279.6 86-342.7 211.4-26 51.8-40.8 110.4-40.8 172.4S151 632.8 177 684.6C240.1 810 369.8 896 519.7 896c103.6 0 190.4-34.4 253.8-93 72.5-66.8 114.4-165.2 114.4-282.1 0-27.2-2.4-53.3-6.9-78.5z" p-id="8366" fill="#1296db"></path></svg>`;
    const result = await loadSVG(svg);
    const expectDataURL = await parseSVGToDataURL(svg);
    const expectImage = await loadImage(expectDataURL);
    expect(result.src).toStrictEqual(expectImage.src);
  });
});
