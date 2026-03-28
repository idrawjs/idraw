import { iDraw, useHistory, findMaterialFromListByPosition, calcResultMovePosition } from 'idraw';
import type { StrictMaterial } from 'idraw';

const getElemBase = () => {
  return {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };
};

function generateMaterials(list: any[]): StrictMaterial[] {
  const materials: StrictMaterial[] = list.map((item) => {
    if (Array.isArray(item)) {
      const groupIds = item[0].split('-');
      groupIds.pop();
      return {
        ...getElemBase(),
        id: groupIds.join('-'),
        type: 'group',
        children: generateMaterials(item),
      };
    } else {
      return {
        ...getElemBase(),
        id: item,
        type: 'rect',
      };
    }
  }) as StrictMaterial[];
  return materials;
}

const createData = (list: any[]) => ({
  materials: generateMaterials(list),
});

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('moveMaterial', () => {
    const getList1 = () => ['0', '1', '2', ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'], '4', '5'];
    const data = createData(getList1());
    const div = document.createElement('div') as HTMLDivElement;

    const idraw = new iDraw(div, {
      height: 200,
      width: 200,
    });
    const { MiddlewareHistory, historyHandler } = useHistory({ core: idraw.getCore() });
    const { undo, redo, __getDoRecords, __getUndoRecords } = historyHandler;
    idraw.use(MiddlewareHistory);
    idraw.setData(data);

    // modify 1: do
    const from1 = [3, 2, 1];
    const to1 = [2];
    // result from: [ 4, 2, 1 ], to: [ 2 ]
    const id1 = findMaterialFromListByPosition(from1, data.materials)?.id as string;
    idraw.moveMaterial(id1, to1);

    const record1 = {
      type: 'moveMaterial',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: id1,
        from: [...from1],
        to: [...to1],
      },
    };

    // ['0', '1', '3-2-1', '2', ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'], '4', '5'];
    const expectedMaterials1 = generateMaterials([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    // const expectedMaterials1 = moveMaterialPosition(generateMaterials(getList1()), {
    //   from: [...from1],
    //   to: [...to1]
    // }).materials;

    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const from2 = [2];
    const to2 = [4];
    const id2 = findMaterialFromListByPosition(from2, data.materials)?.id as string;
    // console.log('id2 ----- ', id2, findMaterialFromListByPosition(to2, data.materials)?.id);
    idraw.moveMaterial(id1, to2);
    const record2 = {
      type: 'moveMaterial',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: id2,
        from: [...from2],
        to: [...to2],
      },
    };
    const expectedMaterials2 = generateMaterials([
      '0',
      '1',
      '2',
      '3-2-1',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    // const expectedMaterials2 = moveMaterialPosition(expectedMaterials1, {
    //   from: [...from2],
    //   to: [...to2]
    // }).materials;
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const moveResult2 = calcResultMovePosition({
      from: [...from2],
      to: [...to2],
    }) as { from: number[]; to: number[] };
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record2.content.id,
        from: [...moveResult2.to],
        to: [...moveResult2.from],
      },
    };
    const expectedMaterials3 = generateMaterials([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    // const expectedMaterials3 = moveMaterialPosition(expectedMaterials1, {
    //   from: [...moveResult2.to],
    //   to: [...moveResult2.from]
    // }).materials;
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials3);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const moveResult3 = calcResultMovePosition({
      from: [...from1],
      to: [...to1],
    }) as { from: number[]; to: number[] };
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record1.content.id,
        from: [...moveResult3.to],
        to: [...moveResult3.from],
      },
    };
    const expectedMaterials4 = generateMaterials([
      '0',
      '1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    // const expectedMaterials4 = moveMaterialPosition(expectedMaterials3, {
    //   from: [...moveResult3.to],
    //   to: [...moveResult3.from]
    // }).materials;
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials4);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record3, record4]);

    // modify 5: redo
    redo();
    const moveResult4 = calcResultMovePosition({
      from: [...record4.content.from],
      to: [...record4.content.to],
    }) as { from: number[]; to: number[] };
    const record5 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record4.content.id,
        from: [...moveResult4.to],
        to: [...moveResult4.from],
      },
    };
    const expectedMaterials5 = generateMaterials([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    // const expectedMaterials5 = moveMaterialPosition(expectedMaterials3, {
    //   from: [...moveResult4.from],
    //   to: [...moveResult4.to]
    // }).materials;
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials5);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 6: redo
    redo();
    const moveResult5 = calcResultMovePosition({
      from: [...record3.content.from],
      to: [...record3.content.to],
    }) as { from: number[]; to: number[] };
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record4.content.id,
        from: [...moveResult5.to],
        to: [...moveResult5.from],
      },
    };
    const expectedMaterials6 = generateMaterials([
      '0',
      '1',
      '2',
      '3-2-1',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials6);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 7: undo
    undo();
    const moveResult6 = calcResultMovePosition({
      from: [...record6.content.from],
      to: [...record6.content.to],
    }) as { from: number[]; to: number[] };
    const record7 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record6.content.id,
        from: [...moveResult6.to],
        to: [...moveResult6.from],
      },
    };
    const expectedMaterials7 = generateMaterials([
      '0',
      '1',
      '3-2-1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials7);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record7]);

    // modify 8: undo
    undo();
    const moveResult7 = calcResultMovePosition({
      from: [...record5.content.from],
      to: [...record5.content.to],
    }) as { from: number[]; to: number[] };
    const record8 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'moveMaterial',
        id: record5.content.id,
        from: [...moveResult7.to],
        to: [...moveResult7.from],
      },
    };
    const expectedMaterials8 = generateMaterials([
      '0',
      '1',
      '2',
      ['3-0', '3-1', ['3-2-0', '3-2-1', '3-2-2', '3-2-3'], '3-3'],
      '4',
      '5',
    ]);
    expect(idraw.getData()?.materials).toStrictEqual(expectedMaterials8);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record7, record8]);
  });
});
