import { iDraw, useHistory, findElementFromListByPosition, calcResultMovePosition } from 'idraw';
import type { Elements } from 'idraw';

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
      const groupIds = item[0].split('-');
      groupIds.pop();
      return {
        ...getElemBase(),
        uuid: groupIds.join('-'),
        type: 'group',
        detail: {
          children: generateElements(item)
        }
      };
    } else {
      return {
        ...getElemBase(),
        uuid: item,
        type: 'rect',
        detail: {}
      };
    }
  }) as Elements;
  return elements;
}

const createData = (list: any[]) => ({
  elements: generateElements(list)
});

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('moveElement', () => {
    const getList1 = () => ['0', '1', '2', ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'], '4', '5'];
    const data = createData(getList1());
    const div = document.createElement('div') as HTMLDivElement;

    const idraw = new iDraw(div, {
      height: 200,
      width: 200
    });
    const { MiddlewareHistory, history } = useHistory({ instance: idraw });
    const { undo, redo, __getDoRecords, __getUndoRecords } = history;
    idraw.use(MiddlewareHistory);
    idraw.setData(data);

    // modify 1: do
    const from1 = [3, 2, 1];
    const to1 = [2];
    // result from: [ 4, 2, 1 ], to: [ 2 ]
    const uuid1 = findElementFromListByPosition(from1, data.elements)?.uuid as string;
    idraw.moveElement(uuid1, to1);

    const record1 = {
      type: 'moveElement',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: uuid1,
        from: [...from1],
        to: [...to1]
      }
    };

    // ['0', '1', '3-2-1', '2', ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'], '4', '5'];
    const expectedElements1 = generateElements([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    // const expectedElements1 = moveElementPosition(generateElements(getList1()), {
    //   from: [...from1],
    //   to: [...to1]
    // }).elements;

    expect(idraw.getData()?.elements).toStrictEqual(expectedElements1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const from2 = [2];
    const to2 = [4];
    const uuid2 = findElementFromListByPosition(from2, data.elements)?.uuid as string;
    // console.log('uuid2 ----- ', uuid2, findElementFromListByPosition(to2, data.elements)?.uuid);
    idraw.moveElement(uuid1, to2);
    const record2 = {
      type: 'moveElement',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: uuid2,
        from: [...from2],
        to: [...to2]
      }
    };
    const expectedElements2 = generateElements([
      '0',
      '1',
      '2',
      '3-2-1',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    // const expectedElements2 = moveElementPosition(expectedElements1, {
    //   from: [...from2],
    //   to: [...to2]
    // }).elements;
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const moveResult2 = calcResultMovePosition({
      from: [...from2],
      to: [...to2]
    }) as { from: number[]; to: number[] };
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record2.content.uuid,
        from: [...moveResult2.to],
        to: [...moveResult2.from]
      }
    };
    const expectedElements3 = generateElements([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    // const expectedElements3 = moveElementPosition(expectedElements1, {
    //   from: [...moveResult2.to],
    //   to: [...moveResult2.from]
    // }).elements;
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements3);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const moveResult3 = calcResultMovePosition({
      from: [...from1],
      to: [...to1]
    }) as { from: number[]; to: number[] };
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record1.content.uuid,
        from: [...moveResult3.to],
        to: [...moveResult3.from]
      }
    };
    const expectedElements4 = generateElements([
      '0',
      '1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    // const expectedElements4 = moveElementPosition(expectedElements3, {
    //   from: [...moveResult3.to],
    //   to: [...moveResult3.from]
    // }).elements;
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements4);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record3, record4]);

    // modify 5: redo
    redo();
    const moveResult4 = calcResultMovePosition({
      from: [...record4.content.from],
      to: [...record4.content.to]
    }) as { from: number[]; to: number[] };
    const record5 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record4.content.uuid,
        from: [...moveResult4.to],
        to: [...moveResult4.from]
      }
    };
    const expectedElements5 = generateElements([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    // const expectedElements5 = moveElementPosition(expectedElements3, {
    //   from: [...moveResult4.from],
    //   to: [...moveResult4.to]
    // }).elements;
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements5);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 6: redo
    redo();
    const moveResult5 = calcResultMovePosition({
      from: [...record3.content.from],
      to: [...record3.content.to]
    }) as { from: number[]; to: number[] };
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record4.content.uuid,
        from: [...moveResult5.to],
        to: [...moveResult5.from]
      }
    };
    const expectedElements6 = generateElements([
      '0',
      '1',
      '2',
      '3-2-1',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements6);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 7: undo
    undo();
    const moveResult6 = calcResultMovePosition({
      from: [...record6.content.from],
      to: [...record6.content.to]
    }) as { from: number[]; to: number[] };
    const record7 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record6.content.uuid,
        from: [...moveResult6.to],
        to: [...moveResult6.from]
      }
    };
    const expectedElements7 = generateElements([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements7);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record7]);

    // modify 8: undo
    undo();
    const moveResult7 = calcResultMovePosition({
      from: [...record5.content.from],
      to: [...record5.content.to]
    }) as { from: number[]; to: number[] };
    const record8 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveElement',
        uuid: record5.content.uuid,
        from: [...moveResult7.to],
        to: [...moveResult7.from]
      }
    };
    const expectedElements8 = generateElements([
      '0',
      '1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5'
    ]);
    expect(idraw.getData()?.elements).toStrictEqual(expectedElements8);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record7, record8]);
  });
});
