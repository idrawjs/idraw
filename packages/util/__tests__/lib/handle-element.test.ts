import { moveElementPosition, deepClone } from '@idraw/util';
import type { Elements } from '@idraw/types';
const getElemBase = () => {
  return {
    x: 0,
    y: 0,
    w: 1,
    h: 1
  };
};
// const elements: Elements = [
//   {
//     ...getElemBase(),
//     uuid: 'rect-01',
//     type: 'rect',
//     detail: {}
//   },
//   {
//     ...getElemBase(),
//     uuid: 'rect-02',
//     type: 'rect',
//     detail: {}
//   },
//   {
//     ...getElemBase(),
//     uuid: 'rect-03',
//     type: 'rect',
//     detail: {}
//   },
//   {
//     ...getElemBase(),
//     uuid: 'group-01',
//     type: 'group',
//     detail: {
//       children: [
//         {
//           ...getElemBase(),
//           uuid: 'rect-04',
//           type: 'rect',
//           detail: {}
//         },
//         {
//           ...getElemBase(),
//           uuid: 'rect-05',
//           type: 'rect',
//           detail: {}
//         },

//         {
//           ...getElemBase(),
//           uuid: 'group-02',
//           type: 'group',
//           detail: {
//             children: [
//               {
//                 ...getElemBase(),
//                 uuid: 'rect-06',
//                 type: 'rect',
//                 detail: {}
//               },
//               {
//                 ...getElemBase(),
//                 uuid: 'rect-07',
//                 type: 'rect',
//                 detail: {}
//               }
//             ]
//           }
//         }
//       ]
//     }
//   }
// ];

function generateElements(list: any[]): Elements {
  const elements: Elements = list.map((item, i) => {
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
        uuid: `rect`,
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
    moveElementPosition(list, {
      from: [2],
      to: [4]
    });

    const expectResult = generateElements([0, 1, 3, 2, 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [4] -> [2] yes
  // [0, 1, 4, 2, 3, 4, 5]
  // [0, 1, 4, 2, 3, 5]
  test('moveElementPosition, move-up [4] -> [2]', () => {
    const list: Elements = generateElements([0, 1, 2, 3, 4, 5]);

    moveElementPosition(list, {
      from: [4],
      to: [2]
    });

    const expectResult = generateElements([0, 1, 4, 2, 3, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [3, 2, 1] -> [2]
  test('moveElementPosition, move-up [3, 2, 1] -> [2]', () => {
    const list: Elements = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);

    moveElementPosition(list, {
      from: [3, 2, 1],
      to: [2]
    });

    const expectResult = generateElements([0, 1, 1, 2, [0, 1, [0, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [1] -> [1, 2, 3]
  test('moveElementPosition, move-up [1] -> [1, 2, 3]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);

    moveElementPosition(list, {
      from: [1],
      to: [1, 2, 3]
    });

    const expectResult = generateElements([0, [0, 1, [0, 1, 2, 3, 4, 5], 3, 4, 5], 2, 3, 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });

  // [1, 2, 3, 4, 5] -> [1, 2, 2]
  test('moveElementPosition, move-up [1, 2, 3, 4, 5] -> [1, 2, 2]', () => {
    const list: Elements = generateElements([0, [0, 1, [0, 1, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4, 5], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5]);

    moveElementPosition(list, {
      from: [1, 2, 3, 4, 5],
      to: [1, 2, 2]
    });

    const expectResult = generateElements([0, [0, 1, [0, 1, 5, 2, [0, 1, 2, 3, [0, 1, 2, 3, 4], 5], 4, 5], 3, 4, 5], 2, 3, 4, 5]);

    expect(list).toStrictEqual(expectResult);
  });

  //
  test('moveElementPosition, move-up [1] -> [1]', () => {
    const list: Elements = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);

    moveElementPosition(list, {
      from: [1],
      to: [1]
    });

    const expectResult = generateElements([0, 1, 2, [0, 1, [0, 1, 2, 3], 3], 4, 5]);
    expect(list).toStrictEqual(expectResult);
  });
});
