import { moveMaterialPosition } from '@idraw/util';
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
  const elements: StrictMaterial[] = list.map((item) => {
    if (Array.isArray(item)) {
      return {
        ...getElemBase(),
        id: `group`,
        type: 'group',
        children: generateMaterials(item),
      };
    } else {
      return {
        ...getElemBase(),
        id: `rect-${item}`,
        type: 'rect',
      };
    }
  }) as StrictMaterial[];
  return elements;
}

describe('@idraw/util: handle-element ', () => {
  // [2] -> [4]
  // [0, 1, 2, 3, 2, 4, 5]
  // [0, 1, 3, 2, 4, 5]
  test('moveMaterialPosition, move-down [2] -> [4]', () => {
    const list: StrictMaterial[] = generateMaterials([0, 1, 2, 3, 4, 5]);
    moveMaterialPosition(list, {
      from: [2],
      to: [4],
    });

    const expectResult = generateMaterials([0, 1, 3, 2, 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [4] -> [2] yes
  // [0, 1, 4, 2, 3, 4, 5]
  // [0, 1, 4, 2, 3, 5]
  test('moveMaterialPosition, move-up [4] -> [2]', () => {
    const list: StrictMaterial[] = generateMaterials([0, 1, 2, 3, 4, 5]);

    moveMaterialPosition(list, {
      from: [4],
      to: [2],
    });

    const expectResult = generateMaterials([0, 1, 4, 2, 3, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [3, 2, 1] -> [2]
  test('moveMaterialPosition, move-up [3, 2, 1] -> [2]', () => {
    const list: StrictMaterial[] = generateMaterials([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);

    moveMaterialPosition(list, {
      from: [3, 2, 1],
      to: [2],
    });

    const expectResult = generateMaterials([0, 1, 1, 2, [0, 1, [0, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [1] -> [1, 2, 3]
  test('moveMaterialPosition, move-up [1] -> [1, 2, 3]', () => {
    const list: StrictMaterial[] = generateMaterials([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);

    moveMaterialPosition(list, {
      from: [1],
      to: [1, 2, 3],
    });

    const expectResult = generateMaterials([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [1, 2, 3, 4, 5] -> [1, 2, 2]
  test('moveMaterialPosition, move-up [1, 2, 3, 4, 5] -> [1, 2, 2]', () => {
    const list: StrictMaterial[] = generateMaterials([
      0,
      [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5,
    ]);

    moveMaterialPosition(list, {
      from: [1, 2, 3, 4, 5],
      to: [1, 2, 2],
    });

    const expectResult = generateMaterials([
      0,
      [0, 1, [0, 1, 5, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5,
    ]);

    expect(list).toStrictEqual(expectResult);
  });

  // [1] -> [1]
  test('moveMaterialPosition, move-up [1] -> [1]', () => {
    const list: StrictMaterial[] = generateMaterials([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);

    moveMaterialPosition(list, {
      from: [1],
      to: [1],
    });

    const expectResult = generateMaterials([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [2, 4] -> [1, 2]
  test('moveMaterialPosition, move-up [1, 2] -> [2, 4]', () => {
    const list: StrictMaterial[] = generateMaterials([0, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 3, 4]);

    moveMaterialPosition(list, {
      from: [2, 4],
      to: [1, 2],
    });
    const expectResult = generateMaterials([0, [0, 1, 4, 2, 3, 4], [0, 1, 2, 3], 3, 4]);

    expect(list).toStrictEqual(expectResult);
  });
});
