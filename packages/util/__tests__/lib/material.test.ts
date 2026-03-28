import { createUUID, getMaterialPositionFromList } from '@idraw/util';
import type { StrictMaterial } from '@idraw/types';
const getElemBase = () => {
  return {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };
};

function generateMaterials(list: any[]): StrictMaterial[] {
  const elements: StrictMaterial[] = list.map((item, i) => {
    if (Array.isArray(item)) {
      return {
        ...getElemBase(),
        id: `${i}-${createUUID()}`,
        type: 'group',
        children: generateMaterials(item),
      };
    } else {
      return {
        ...getElemBase(),
        id: `${i}-${createUUID()}`,
        type: 'rect',
      };
    }
  }) as StrictMaterial[];
  return elements;
}

describe('@idraw/util: element ', () => {
  // [4]
  test('getMaterialPositionFromList [4]', () => {
    const list: StrictMaterial[] = generateMaterials([
      0,
      [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5,
    ]);
    const id = (list as any)[4].id;
    const position = getMaterialPositionFromList(id, list);
    expect(position).toStrictEqual([4]);
  });

  // [1, 2, 3, 4, 5]
  test('getMaterialPositionFromList [1, 2, 3, 4, 5]', () => {
    const list: StrictMaterial[] = generateMaterials([
      0,
      [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5,
    ]);
    const id = (list as any)[1].children[2].children[3].children[4].children[5].id;
    const position = getMaterialPositionFromList(id, list);
    expect(position).toStrictEqual([1, 2, 3, 4, 5]);
  });

  // [1, 2, 3, 4]
  test('getMaterialPositionFromList [1, 2, 3, 4, 5]', () => {
    const list: StrictMaterial[] = generateMaterials([
      0,
      [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5,
    ]);
    const id = (list as any)[1].children[2].children[3].children[4].id;
    const position = getMaterialPositionFromList(id, list);
    expect(position).toStrictEqual([1, 2, 3, 4]);
  });
});
