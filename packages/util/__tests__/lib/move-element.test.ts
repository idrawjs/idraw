import { moveElementPosition, calcRevertMovePosition } from '@idraw/util';
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
  const elements: Elements = list.map((item) => {
    if (Array.isArray(item)) {
      return {
        ...getElemBase(),
        uuid: `group`,
        type: 'group',
        detail: {
          children: generateElements(item)
        }
      };
    } else {
      return {
        ...getElemBase(),
        uuid: `rect-${item}`,
        type: 'rect',
        detail: {}
      };
    }
  }) as Elements;
  return elements;
}

describe('@idraw/util: handle-element ', () => {
  // [2] -> [4]
  // [0, 1, 2, 3, 2, 4, 5]
  // [0, 1, 3, 2, 4, 5]
  test('moveElementPosition, move-down [2] -> [4]', () => {
    const list: Elements = generateElements([0, 1, 2, 3, 4, 5]);
    const from = [2];
    const to = [4];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, 1, 3, 2, 4, 5]);
    expect(list).toStrictEqual(expectResult);
    // revert action
    // result [2] [3]
    const revertInfo = calcRevertMovePosition({ from, to }) as { from: number[]; to: number[] };
    // revert [3] -> [2]
    moveElementPosition(list, {
      from: revertInfo.from,
      to: revertInfo.to
    });
    expect(list).toStrictEqual(generateElements([0, 1, 2, 3, 4, 5]));
  });

  // [4] -> [2] yes
  // [0, 1, 4, 2, 3, 4, 5]
  // [0, 1, 4, 2, 3, 5]
  test('moveElementPosition, move-up [4] -> [2]', () => {
    const list: Elements = generateElements([0, 1, 2, 3, 4, 5]);
    const from = [4];
    const to = [2];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, 1, 4, 2, 3, 5]);
    expect(list).toStrictEqual(expectResult);
    // revert action
    // result [5] [2]
    const revertInfo = calcRevertMovePosition({ from, to }) as { from: number[]; to: number[] };
    // revert [2] -> [5]
    moveElementPosition(list, {
      from: revertInfo.from,
      to: revertInfo.to
    });
    expect(list).toStrictEqual(generateElements([0, 1, 2, 3, 4, 5]));
  });

  // [3, 2, 1] -> [2]
  test('moveElementPosition, move-up [3, 2, 1] -> [2]', () => {
    const list: Elements = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);
    const from = [3, 2, 1];
    const to = [2];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, 1, 1, 2, [0, 1, [0, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
    // revert action
    // result from: [ 4, 2, 1 ], to: [ 2 ]
    const revertInfo = calcRevertMovePosition({ from, to }) as { from: number[]; to: number[] };
    // revert [2] -> [ 4, 2, 1 ]
    moveElementPosition(list, {
      from: revertInfo.from,
      to: revertInfo.to
    });
    expect(list).toStrictEqual(generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]));
  });

  // [1] -> [1, 2, 3]
  test('moveElementPosition, move-up [1] -> [1, 2, 3]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    const from = [1];
    const to = [1, 2, 3];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    expect(list).toStrictEqual(expectResult);
    // revert action null
    const revertInfo = calcRevertMovePosition({ from, to });
    expect(revertInfo).toBeNull();
  });

  // [1, 2, 3, 4, 5] -> [1, 2, 2]
  test('moveElementPosition, move-up [1, 2, 3, 4, 5] -> [1, 2, 2]', () => {
    const list: Elements = generateElements([
      0,
      [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5
    ]);
    const from = [1, 2, 3, 4, 5];
    const to = [1, 2, 2];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([
      0,
      [0, 1, [0, 1, 5, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4], 5], 4, 5], 3, 4, 5],
      2,
      3,
      4,
      5
    ]);
    expect(list).toStrictEqual(expectResult);
    // revert action
    // result from: [ 1, 2, 4, 4, 5 ], to: [ 1, 2, 2 ]
    const revertInfo = calcRevertMovePosition({ from, to }) as { from: number[]; to: number[] };
    // revert [ 1, 2, 2 ] -> [ 1, 2, 4, 4, 5 ]
    moveElementPosition(list, {
      from: revertInfo.from,
      to: revertInfo.to
    });
    expect(list).toStrictEqual(
      generateElements([0, [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5])
    );
  });

  // [1] -> [1]
  test('moveElementPosition, move-up [1] -> [1]', () => {
    const list: Elements = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);
    const from = [1];
    const to = [1];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
    // revert action null
    const revertInfo = calcRevertMovePosition({ from, to });
    expect(revertInfo).toBeNull();
  });

  // [2, 4] -> [1, 2]
  test('moveElementPosition, move-up [1, 2] -> [2, 4]', () => {
    const list: Elements = generateElements([0, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 3, 4]);
    const from = [2, 4];
    const to = [1, 2];
    moveElementPosition(list, {
      from,
      to
    });
    const expectResult = generateElements([0, [0, 1, 4, 2, 3, 4], [0, 1, 2, 3], 3, 4]);
    expect(list).toStrictEqual(expectResult);

    // revert action
    // result from: [ 2, 4 ], to: [ 1, 2 ]
    const revertInfo = calcRevertMovePosition({ from, to }) as { from: number[]; to: number[] };

    // revert [ 1, 2 ] -> [ 2, 4 ]
    moveElementPosition(list, {
      from: revertInfo.from,
      to: revertInfo.to
    });
    expect(list).toStrictEqual(generateElements([0, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 3, 4]));
  });
});
