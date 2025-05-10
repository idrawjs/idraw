import { deepClone, filterCompactData } from '@idraw/util';
import type { Data } from '@idraw/types';
import { imageBase64, html, svg } from '../_assets/base';

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
      uuid: '063e3a80-1ede-7912-f919-975e34a9bd01',
      type: 'group',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        children: [
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

describe('@idraw/util: data ', () => {
  test('filterCompactData', () => {
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
          detail: { src: '@assets/0a920a91-0aba-0af3-0aeb-0a730accafb' }
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
                uuid: 'b60e64e8-833e-e112-d7eb-1ab6e7d6870c',
                type: 'svg',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { svg: '@assets/0a830ab3-0a5d-0a5b-0a63-0a740a6cb34' }
              },
              {
                uuid: '61f2a61e-cdd5-ae36-983f-686ba8e35973',
                type: 'html',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { html: '@assets/0a2b0ab4-0b45-0b19-0a0d-0add0a0dab5' }
              }
            ]
          }
        }
      ],
      assets: {
        '@assets/0a920a91-0aba-0af3-0aeb-0a730accafb': {
          type: 'image',
          value: imageBase64
        },
        '@assets/0a830ab3-0a5d-0a5b-0a63-0a740a6cb34': {
          type: 'svg',
          value: svg
        },
        '@assets/0a2b0ab4-0b45-0b19-0a0d-0add0a0dab5': {
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
