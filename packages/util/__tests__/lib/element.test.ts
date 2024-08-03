import { createUUID, getElementPositionFromList } from '@idraw/util';
import type { Elements } from '@idraw/types';
const getElemBase = () => {
  return {
    x: 0,
    y: 0,
    w: 1,
    h: 1
  };
};

function generateElements(list: any[]): Elements {
  const elements: Elements = list.map((item, i) => {
    if (Array.isArray(item)) {
      return {
        ...getElemBase(),
        uuid: `${i}-${createUUID()}`,
        type: 'group',
        detail: {
          children: generateElements(item)
        }
      };
    } else {
      return {
        ...getElemBase(),
        uuid: `${i}-${createUUID()}`,
        type: 'rect',
        detail: {}
      };
    }
  }) as Elements;
  return elements;
}

describe('@idraw/util: element ', () => {
  // [4]
  test('getElementPositionFromList [4]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    const uuid = (list as any)[4].uuid;
    const position = getElementPositionFromList(uuid, list);
    expect(position).toStrictEqual([4]);
  });

  // [1, 2, 3, 4, 5]
  test('getElementPositionFromList [1, 2, 3, 4, 5]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    const uuid = (list as any)[1].detail.children[2].detail.children[3].detail.children[4].detail.children[5].uuid;
    const position = getElementPositionFromList(uuid, list);
    expect(position).toStrictEqual([1, 2, 3, 4, 5]);
  });

  // [1, 2, 3, 4]
  test('getElementPositionFromList [1, 2, 3, 4, 5]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    const uuid = (list as any)[1].detail.children[2].detail.children[3].detail.children[4].uuid;
    const position = getElementPositionFromList(uuid, list);
    expect(position).toStrictEqual([1, 2, 3, 4]);
  });
});
