import { iDraw, useHistory, deepClone, createMaterial, set, get, toFlattenGlobal } from 'idraw';
import type { Data, DataGlobal, RecursivePartial } from 'idraw';

const createData = () =>
  ({
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
  } as Data);

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('modifyGlobal', () => {
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
    const modifiedInfo1 = {
      fill: '#123456',
    };
    idraw.modifyGlobal({
      ...deepClone(modifiedInfo1),
    });
    const expectedData1 = createData();
    const flattenModifiedInfo1 = toFlattenGlobal(modifiedInfo1);
    const beforeInfo1: Record<string, unknown> | null = null;
    const afterInfo1 = { ...flattenModifiedInfo1 };

    Object.keys(flattenModifiedInfo1).forEach((k) => {
      const key = `global.${k}`;
      set(expectedData1, key, flattenModifiedInfo1[k]);
    });
    const record1 = {
      type: 'modifyGlobal',
      time: new Date().getTime(),
      content: {
        method: 'modifyGlobal',
        before: beforeInfo1,
        after: afterInfo1,
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const modifiedInfo2 = {
      fill: '#AAAAAA',
    } as unknown as RecursivePartial<DataGlobal>;

    idraw.modifyGlobal({ ...modifiedInfo2 });

    const expectedData2 = deepClone(expectedData1);
    const flattenModifiedInfo2 = toFlattenGlobal(modifiedInfo2);
    const beforeInfo2: Record<string, unknown> = {};
    const afterInfo2 = { ...flattenModifiedInfo2 };

    Object.keys(flattenModifiedInfo2).forEach((key) => {
      beforeInfo2[key] = get(expectedData1.global, key);
      set(expectedData2.global, key, flattenModifiedInfo2[key]);
    });
    const record2 = {
      type: 'modifyGlobal',
      time: new Date().getTime(),
      content: {
        method: 'modifyGlobal',
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
        method: 'modifyGlobal',
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
        method: 'modifyGlobal',
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
        method: 'modifyGlobal',
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
        method: 'modifyGlobal',
        before: deepClone(record3.content.after),
        after: deepClone(record3.content.before),
      },
    };
    expect(idraw.getData()).toStrictEqual(expectedData2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
