import { iDraw, useHistory, deepClone, createMaterial, set, get, toFlattenMaterial } from 'idraw';
import type { RecursivePartial, Material } from 'idraw';

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

  test('modifyMaterial', () => {
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
    const modifiedInfo1 = {
      x: targetMaterial.x + 1,
      y: targetMaterial.y + 2,
      fill: '#123456',
      cornerRadius: 3,
    };
    idraw.modifyMaterial({
      id: targetMaterial.id,
      ...deepClone(modifiedInfo1),
    });
    const expectedData1 = createData();
    const flattenModifiedInfo1 = toFlattenMaterial(modifiedInfo1);
    const beforeInfo1: Record<string, unknown> = {};
    const afterInfo1 = { ...flattenModifiedInfo1 };
    Object.keys(flattenModifiedInfo1).forEach((key) => {
      beforeInfo1[key] = get(expectedData1.materials[0], key);
      set(expectedData1.materials[0], key, flattenModifiedInfo1[key]);
    });
    const record1 = {
      type: 'modifyMaterial',
      time: new Date().getTime(),
      content: {
        method: 'modifyMaterial',
        id: targetMaterial.id,
        before: beforeInfo1,
        after: afterInfo1,
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const modifiedInfo2 = {
      x: modifiedInfo1.x + 3,
      y: modifiedInfo1.y + 4,
      cornerRadius: [2, 4, 6, 8],
    } as unknown as RecursivePartial<Omit<Material, 'id'>>;

    idraw.modifyMaterial({
      id: targetMaterial.id,
      ...deepClone(modifiedInfo2),
    } as RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>);

    const expectedData2 = deepClone(expectedData1);
    const flattenModifiedInfo2 = toFlattenMaterial(modifiedInfo2);
    const beforeInfo2: Record<string, unknown> = {};
    const afterInfo2 = { ...flattenModifiedInfo2 };

    Object.keys(flattenModifiedInfo2).forEach((key) => {
      let beforeVal = get(expectedData1.materials[0], key);
      let beforeKey = key;
      if (beforeVal === undefined && /(cornerRadius|strokeWidth)\[[0-9]{1,}\]$/.test(beforeKey)) {
        beforeKey = beforeKey.replace(/\[[0-9]{1,}\]$/, '');
        beforeVal = get(expectedData1.materials[0], beforeKey);
      }
      beforeInfo2[beforeKey] = beforeVal;
      set(expectedData2.materials[0], key, flattenModifiedInfo2[key]);
    });
    const record2 = {
      type: 'modifyMaterial',
      time: new Date().getTime(),
      content: {
        method: 'modifyMaterial',
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
        method: 'modifyMaterial',
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
        method: 'modifyMaterial',
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
        method: 'modifyMaterial',
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
        method: 'modifyMaterial',
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
