import { iDraw, useHistory, deepClone, createMaterial, toFlattenMaterial, mergeMaterial } from 'idraw';

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
    createMaterial('circle', { id: 'test-002' }),
    createMaterial('text', {
      id: 'test-003',
      text: 'Hello World',
    }),
    createMaterial('image', { id: 'test-004', src: 'https://example.com/001.png' }),
    createMaterial('group', {
      id: 'test-005',
      children: [
        createMaterial('rect', { id: 'test-006' }),
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
    const targetMaterial = deepClone(data.materials[0]);

    // modify 1: do
    const updatedMaterial1 = deepClone(targetMaterial);
    updatedMaterial1.x += 1;
    updatedMaterial1.y += 2;
    updatedMaterial1.fill = '#123456';
    updatedMaterial1.cornerRadius = 3;
    idraw.updateMaterial(updatedMaterial1);

    const beforeInfo1: Record<string, any> = toFlattenMaterial(targetMaterial);
    const afterInfo1: Record<string, any> = toFlattenMaterial(updatedMaterial1);

    const expectedData1 = createData();
    mergeMaterial(expectedData1.materials[0], updatedMaterial1);
    const record1 = {
      type: 'updateMaterial',
      time: new Date().getTime(),
      content: {
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: beforeInfo1,
        after: afterInfo1,
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const updatedMaterial2 = deepClone(updatedMaterial1);
    updatedMaterial2.x += 3;
    updatedMaterial2.y += 4;
    updatedMaterial2.cornerRadius = [2, 4, 6, 8];
    idraw.updateMaterial(updatedMaterial2);
    const beforeInfo2: Record<string, any> = toFlattenMaterial(updatedMaterial1);
    const afterInfo2: Record<string, any> = toFlattenMaterial(updatedMaterial2);

    const expectedData2 = createData();
    mergeMaterial(expectedData2.materials[0], updatedMaterial2);
    const record2 = {
      type: 'updateMaterial',
      time: new Date().getTime(),
      content: {
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: beforeInfo2,
        after: afterInfo2,
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: deepClone(record2.content.after),
        after: deepClone(record2.content.before),
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: deepClone(record1.content.after),
        after: deepClone(record1.content.before),
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
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: deepClone(record4.content.after),
        after: deepClone(record4.content.before),
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 5: redo
    redo();
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'updateMaterial',
        id: targetMaterial.id,
        before: deepClone(record3.content.after),
        after: deepClone(record3.content.before),
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
