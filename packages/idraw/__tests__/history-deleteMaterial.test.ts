import { iDraw, useHistory, deepClone, createMaterial, findMaterialFromListByPosition } from 'idraw';
import type { Material } from 'idraw';

const createData = () => ({
  materials: [
    createMaterial('rect', {
      id: 'test-000',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#DDDDDD',
    }),
    createMaterial('group', {
      id: 'test-001',
      children: [
        createMaterial('image', { id: 'test-001-000', src: 'https://example.com/001.png' }),
        createMaterial('circle', { id: 'test-001-001' }),
        createMaterial('text', {
          id: 'test-001-002',
          text: 'Text in Group',
        }),
        createMaterial('image', { id: 'test-001-003', src: 'https://example.com/002.png' }),
        createMaterial('rect', { id: 'test-001-004' }),
        createMaterial('circle', { id: 'test-001-005' }),
      ],
    }),
  ],
});

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('updateMaterial', () => {
    const data = createData();
    const div = document.createElement('div') as HTMLDivElement;

    const idraw = new iDraw(div, {
      height: 200,
      width: 200,
    });
    const { MiddlewareHistory, historyHandler } = useHistory({ core: idraw.getCore() });
    const { undo, redo, __getDoRecords, __getUndoRecords } = historyHandler;
    idraw.use(MiddlewareHistory);
    idraw.setData(data);

    const position = [1, 2];
    const nextPosition = [1, 3];

    // modify 1: do
    const deletedElem1 = deepClone(findMaterialFromListByPosition(position, data.materials) as Material);
    const expectedElem1 = deepClone(findMaterialFromListByPosition(nextPosition, data.materials) as Material);
    idraw.deleteMaterial(deletedElem1?.id);
    const record1 = {
      type: 'deleteMaterial',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: deletedElem1.id,
        position: [...position],
        material: deepClone(deletedElem1),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(expectedElem1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const deletedElem2 = deepClone(findMaterialFromListByPosition(position, data.materials) as Material);
    const expectedElem2 = deepClone(findMaterialFromListByPosition(nextPosition, data.materials) as Material);
    idraw.deleteMaterial(deletedElem2?.id);
    const record2 = {
      type: 'deleteMaterial',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: deletedElem2.id,
        position: [...position],
        material: deepClone(deletedElem2),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(expectedElem2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: record2.content.id,
        position: deepClone(record2.content.position),
        material: deepClone(record2.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(deletedElem2);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: record1.content.id,
        position: deepClone(record1.content.position),
        material: deepClone(record1.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(deletedElem1);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record3, record4]);

    // modify 5: redo
    redo();
    const record5 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: record4.content.id,
        position: record4.content.position,
        material: deepClone(record4.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(expectedElem1);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 5: redo
    redo();
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: record3.content.id,
        position: record3.content.position,
        material: deepClone(record3.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(expectedElem2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
