import { deepClone, filterCompactData } from '../../src/lib/data';
import { imageBase64, html, svg } from '../_assets/base';
import type { Data } from '@idraw/types';

describe('@idraw/util: lib/data', () => {
  const json = {
    num: 123,
    str: 'abc',
    bool: true,
    arr: [
      {
        num: 1,
        str: 'a',
        bool: false
      },
      {
        num: 2,
        str: 'b',
        bool: false
      }
    ],
    json: {
      num: 10,
      str: 'aaaa',
      bool: false,
      json: {
        num: 11,
        str: 'bbbb',
        bool: false
      }
    }
  };

  const json2 = deepClone(json);
  json2.json.json.num *= 2;

  test('deepClone', async () => {
    const result = deepClone(json);
    result.json.json.num *= 2;
    expect(result).toStrictEqual(json2);
  });

  test('filterCompactData', () => {
    const originData: Data = {
      elements: [
        {
          uuid: 'b37213ce-d711-cbb3-51ac-d8081c19f127',
          type: 'image',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            src: imageBase64
          }
        },
        {
          uuid: '39308517-e10f-76df-43a9-50ed7295e61e',
          type: 'svg',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            svg: svg
          }
        },
        {
          uuid: 'ef934ab7-a32e-040c-9ac0-ed193405e6e4',
          type: 'html',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            html: html
          }
        },
        {
          uuid: '063e3a80-1ede-7912-f919-975e34a9bd01',
          type: 'group',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            children: [
              {
                uuid: 'e0889472-1f16-d6cd-3c7a-4b827d52279d',
                type: 'image',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: {
                  src: imageBase64
                }
              },
              {
                uuid: 'b60e64e8-833e-e112-d7eb-1ab6e7d6870c',
                type: 'svg',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: {
                  svg: svg
                }
              },
              {
                uuid: '61f2a61e-cdd5-ae36-983f-686ba8e35973',
                type: 'html',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: {
                  html: html
                }
              }
            ]
          }
        }
      ]
    };
    const data = deepClone(originData);
    const compactData = filterCompactData(data);

    const expectData: Data = {
      elements: [
        {
          uuid: 'b37213ce-d711-cbb3-51ac-d8081c19f127',
          type: 'image',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: { src: '@assets/1919ff71-124e-2766-23bb-9a251bf3241c' }
        },
        {
          uuid: '39308517-e10f-76df-43a9-50ed7295e61e',
          type: 'svg',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: { svg: '@assets/b9b92016-5290-54e8-9668-807574952823' }
        },
        {
          uuid: 'ef934ab7-a32e-040c-9ac0-ed193405e6e4',
          type: 'html',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: { html: '@assets/34017fa0-2d48-2506-3464-238f34642b5c' }
        },
        {
          uuid: '063e3a80-1ede-7912-f919-975e34a9bd01',
          type: 'group',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            children: [
              {
                uuid: 'e0889472-1f16-d6cd-3c7a-4b827d52279d',
                type: 'image',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { src: '@assets/1919ff71-124e-2766-23bb-9a251bf3241c' }
              },
              {
                uuid: 'b60e64e8-833e-e112-d7eb-1ab6e7d6870c',
                type: 'svg',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { svg: '@assets/b9b92016-5290-54e8-9668-807574952823' }
              },
              {
                uuid: '61f2a61e-cdd5-ae36-983f-686ba8e35973',
                type: 'html',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { html: '@assets/34017fa0-2d48-2506-3464-238f34642b5c' }
              }
            ]
          }
        }
      ],
      assets: {
        '@assets/1919ff71-124e-2766-23bb-9a251bf3241c': {
          type: 'image',
          value: imageBase64
        },
        '@assets/b9b92016-5290-54e8-9668-807574952823': {
          type: 'svg',
          value: svg
        },
        '@assets/34017fa0-2d48-2506-3464-238f34642b5c': {
          type: 'html',
          value: html
        }
      }
    };
    expect(compactData).toStrictEqual(expectData);

    const data2: Data = deepClone<Data>(expectData);
    const compactData2 = filterCompactData(data2);
    expect(compactData2).toStrictEqual(expectData);
  });
});
