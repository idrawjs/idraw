/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as util from '../src';

const types = {
  Context2D: 'Function',
  check: 'Object',
  createUUID: 'Function',
  deepClone: 'Function',
  delay: 'Function',
  downloadImageFromCanvas: 'Function',
  is: 'Object',
  isColorStr: 'Function',
  istype: 'Object',
  loadHTML: 'AsyncFunction',
  loadImage: 'Function',
  loadSVG: 'AsyncFunction',
  throttle: 'Function',
  toColorHexNum: 'Function',
  toColorHexStr: 'Function'
};

function getType(data: any): string {
  const typeStr = Object.prototype.toString.call(data) || '';
  const result = typeStr.replace(/(\[object|\])/gi, '').trim();
  return result;
}

describe('@idraw/util', () => {
  // test('index', async () => {
  //   const keys = Object.keys(util);
  //   keys.forEach((key) => {
  //     // @ts-ignore
  //     const type = getType(util[key]);
  //     // @ts-ignore
  //     expect(type).toStrictEqual(types[key]);
  //   });
  // });

  test('index', async () => {
    const keys = Object.keys(types);
    keys.forEach((key) => {
      // @ts-ignore
      const type = getType(util[key]);
      // @ts-ignore
      expect(type).toStrictEqual(types[key]);
    });
  });
});
