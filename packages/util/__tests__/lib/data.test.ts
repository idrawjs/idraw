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
          detail: { src: '@assets/1k7sknuo56gr0h9ug9hs5g5xxgzeee07' }
        },
        {
          uuid: '39308517-e10f-76df-43a9-50ed7295e61e',
          type: 'svg',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: { svg: '@assets/36jxqyevkyph8yveb6zalsgxj5vc8not' }
        },
        {
          uuid: 'ef934ab7-a32e-040c-9ac0-ed193405e6e4',
          type: 'html',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: { html: '@assets/cevdw4d1r85ynahctsjex89y03yev87a' }
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
                detail: { src: '@assets/1k7sknuo56gr0h9ug9hs5g5xxgzeee07' }
              },
              {
                uuid: 'b60e64e8-833e-e112-d7eb-1ab6e7d6870c',
                type: 'svg',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { svg: '@assets/36jxqyevkyph8yveb6zalsgxj5vc8not' }
              },
              {
                uuid: '61f2a61e-cdd5-ae36-983f-686ba8e35973',
                type: 'html',
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                detail: { html: '@assets/cevdw4d1r85ynahctsjex89y03yev87a' }
              }
            ]
          }
        }
      ],
      assets: {
        '@assets/1k7sknuo56gr0h9ug9hs5g5xxgzeee07': {
          type: 'image',
          value: imageBase64
        },
        '@assets/36jxqyevkyph8yveb6zalsgxj5vc8not': {
          type: 'svg',
          value: svg
        },
        '@assets/cevdw4d1r85ynahctsjex89y03yev87a': {
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
