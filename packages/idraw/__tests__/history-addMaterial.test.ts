import { iDraw, useHistory, deepClone, createMaterial, findMaterialFromListByPosition } from 'idraw';

const createData = () => ({
  materials: [
    createMaterial('rect', {
      id: 'test-001',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#DDDDDD',
    }),
    createMaterial('group', {
      id: 'test-005',
      children: [
        createMaterial('image', { id: 'test-004', src: 'https://example.com/001.png' }),
        createMaterial('circle', { id: 'test-007' }),
        createMaterial('text', {
          id: 'test-008',
          text: 'Text in Group',
        }),
        createMaterial('image', { id: 'test-009', src: 'https://example.com/002.png' }),
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

    // modify 1: do
    const newMaterial1 = idraw.createMaterial('rect', {
      x: 22,
      y: 33,
      height: 300,
      width: 400,
      name: 'new material 001',
      fill: '#666666',
    });
    const position = [1, 2];
    idraw.addMaterial(newMaterial1, {
      position,
    });
    const record1 = {
      type: 'addMaterial',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: newMaterial1.id,
        position: [...position],
        material: deepClone(newMaterial1),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(newMaterial1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const newMaterial2 = idraw.createMaterial('text', {
      x: 22,
      y: 33,
      height: 300,
      width: 400,
      name: 'new material 002',
      text: 'Hello Material',
    });
    idraw.addMaterial(newMaterial2, { position });
    const record2 = {
      type: 'addMaterial',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: newMaterial2.id,
        position: [...position],
        material: deepClone(newMaterial2),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(newMaterial2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: record2.content.id,
        position: deepClone(record2.content.position),
        material: deepClone(record2.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(newMaterial1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'deleteMaterial',
        id: record1.content.id,
        position: deepClone(record1.content.position),
        material: deepClone(record1.content.material),
      },
    };
    expect(idraw.getData()).toStrictEqual(createData());
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record3, record4]);

    // modify 5: redo
    redo();
    const record5 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: record4.content.id,
        position: record4.content.position,
        material: deepClone(record4.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(newMaterial1);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 5: redo
    redo();
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'addMaterial',
        id: record3.content.id,
        position: record3.content.position,
        material: deepClone(record3.content.material),
      },
    };
    expect(findMaterialFromListByPosition(position, idraw.getData()?.materials || [])).toStrictEqual(newMaterial2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
