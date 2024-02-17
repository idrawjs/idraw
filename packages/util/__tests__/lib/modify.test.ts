import { getModifiedElement } from '@idraw/util';
import type { ModifiedElement, Element } from '@idraw/types';

describe('modify', () => {
  const originElement: Element = {
    uuid: 'b37213ce-d711-cbb3-51ac-d8081c19f127',
    type: 'rect',
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    detail: {
      background: '#A0A0A0'
    }
  };

  test('getModifiedElement', () => {
    const elem: ModifiedElement = {
      uuid: 'xxxxxx',
      x: 5,
      y: 10,
      detail: {
        background: 'red'
      }
    } as ModifiedElement;
    const modifiedElem = getModifiedElement(elem, originElement);
    expect(modifiedElem).toStrictEqual({
      x: 0,
      y: 0,
      detail: {
        background: '#A0A0A0'
      }
    });
  });
});
