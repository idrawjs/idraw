import type { Material } from '@idraw/types';
import { groupMaterialsByPosition, ungroupMaterialsByPosition } from '@idraw/util';

const createList = () => {
  const list: Material[] = [
    { id: '0', type: 'rect', x: 20, y: 20, width: 50, height: 50 },
    { id: '1', type: 'rect', x: 40, y: 40, width: 50, height: 50 },
    { id: '2', type: 'rect', x: 60, y: 60, width: 50, height: 50 },
    { id: '3', type: 'rect', x: 80, y: 80, width: 50, height: 50 },
    { id: '4', type: 'rect', x: 100, y: 100, width: 50, height: 50 },
  ];
  return list;
};

const createGroupedList = () => {
  const list: Material[] = [
    { id: '0', type: 'rect', x: 20, y: 20, width: 50, height: 50 },
    {
      name: 'Group',
      id: 'group-id',
      type: 'group',
      x: 40,
      y: 40,
      width: 90,
      height: 90,
      children: [
        { id: '1', type: 'rect', x: 0, y: 0, width: 50, height: 50 },
        { id: '2', type: 'rect', x: 20, y: 20, width: 50, height: 50 },
        { id: '3', type: 'rect', x: 40, y: 40, width: 50, height: 50 },
      ],
    },
    { id: '4', type: 'rect', x: 100, y: 100, width: 50, height: 50 },
  ];
  return list;
};

describe('@idraw/util: group ', () => {
  test('groupMaterialsByPosition', () => {
    const list = createList();
    groupMaterialsByPosition(list, [[1], [2], [3]]);
    list[1].id = 'group-id';
    expect(list).toStrictEqual(createGroupedList());
  });

  test('groupMaterialsByPosition with disordered positions', () => {
    const list = createList();
    groupMaterialsByPosition(list, [[3], [1], [2]]);
    list[1].id = 'group-id';
    expect(list).toStrictEqual(createGroupedList());
  });

  test('groupMaterialsByPosition with deep position', () => {
    const list = createList();
    list[0].type = 'group';
    list[0].children = createList();
    groupMaterialsByPosition(list, [
      [0, 1],
      [0, 2],
      [0, 3],
    ]);
    list[0].children[1].id = 'group-id';

    const expectedList = createList();
    expectedList[0].type = 'group';
    expectedList[0].children = createGroupedList();
    expect(list).toStrictEqual(expectedList);
  });

  test('groupMaterialsByPosition with deep position and disordered positions', () => {
    const list = createList();
    list[0].type = 'group';
    list[0].children = createList();
    groupMaterialsByPosition(list, [
      [0, 3],
      [0, 1],
      [0, 2],
    ]);
    list[0].children[1].id = 'group-id';
    const expectedList = createList();
    expectedList[0].type = 'group';
    expectedList[0].children = createGroupedList();
    expect(list).toStrictEqual(expectedList);
  });

  test('upgroupMaterialsByPosition', () => {
    const list = createGroupedList();
    ungroupMaterialsByPosition(list, [1]);
    expect(list).toStrictEqual(createList());
  });
});
