import type { Element } from '@idraw/types';
import { groupElementsByPosition, ungroupElementsByPosition, insertElementToListByPosition } from '@idraw/util';

const createList = () => {
  const list: Element[] = [
    { uuid: '0', type: 'rect', x: 20, y: 20, w: 50, h: 50, detail: {} },
    { uuid: '1', type: 'rect', x: 40, y: 40, w: 50, h: 50, detail: {} },
    { uuid: '2', type: 'rect', x: 60, y: 60, w: 50, h: 50, detail: {} },
    { uuid: '3', type: 'rect', x: 80, y: 80, w: 50, h: 50, detail: {} },
    { uuid: '4', type: 'rect', x: 100, y: 100, w: 50, h: 50, detail: {} }
  ];
  return list;
};

const createGroupedList = () => {
  const list: Element[] = [
    { uuid: '0', type: 'rect', x: 20, y: 20, w: 50, h: 50, detail: {} },
    {
      name: 'Group',
      uuid: 'group-id',
      type: 'group',
      x: 40,
      y: 40,
      w: 90,
      h: 90,
      detail: {
        children: [
          { uuid: '1', type: 'rect', x: 0, y: 0, w: 50, h: 50, detail: {} },
          { uuid: '2', type: 'rect', x: 20, y: 20, w: 50, h: 50, detail: {} },
          { uuid: '3', type: 'rect', x: 40, y: 40, w: 50, h: 50, detail: {} }
        ]
      }
    },
    { uuid: '4', type: 'rect', x: 100, y: 100, w: 50, h: 50, detail: {} }
  ];
  return list;
};

describe('@idraw/util: group ', () => {
  test('groupElementsByPosition', () => {
    const list = createList();
    groupElementsByPosition(list, [[1], [2], [3]]);
    list[1].uuid = 'group-id';
    expect(list).toStrictEqual(createGroupedList());
  });

  test('groupElementsByPosition with disordered positions', () => {
    const list = createList();
    groupElementsByPosition(list, [[3], [1], [2]]);
    list[1].uuid = 'group-id';
    expect(list).toStrictEqual(createGroupedList());
  });

  test('groupElementsByPosition with deep position', () => {
    const list = createList();
    list[0].type = 'group';
    list[0].detail = { children: createList() };
    groupElementsByPosition(list, [
      [0, 1],
      [0, 2],
      [0, 3]
    ]);
    list[0].detail.children[1].uuid = 'group-id';

    const expectedList = createList();
    expectedList[0].type = 'group';
    expectedList[0].detail = { children: createGroupedList() };
    expect(list).toStrictEqual(expectedList);
  });

  test('groupElementsByPosition with deep position and disordered positions', () => {
    const list = createList();
    list[0].type = 'group';
    list[0].detail = { children: createList() };
    groupElementsByPosition(list, [
      [0, 3],
      [0, 1],
      [0, 2]
    ]);
    list[0].detail.children[1].uuid = 'group-id';
    const expectedList = createList();
    expectedList[0].type = 'group';
    expectedList[0].detail = { children: createGroupedList() };
    expect(list).toStrictEqual(expectedList);
  });

  test('upgroupElementsByPosition', () => {
    const list = createGroupedList();
    ungroupElementsByPosition(list, [1]);
    expect(list).toStrictEqual(createList());
  });
});
