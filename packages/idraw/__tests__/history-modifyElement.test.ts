import { iDraw, useHistory, deepClone, createElement, set, get, toFlattenElement } from 'idraw';
import type { RecursivePartial, Element } from 'idraw';

const createData = () => ({
  elements: [
    createElement('rect', {
      uuid: 'test-001',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        background: '#DDDDDD'
      }
    }),
    createElement('circle', { uuid: 'test-002' }),
    createElement('text', {
      uuid: 'test-003',
      detail: {
        text: 'Hello World'
      }
    }),
    createElement('image', { uuid: 'test-004', detail: { src: 'https://example.com/001.png' } }),
    createElement('group', {
      uuid: 'test-005',
      detail: {
        children: [
          createElement('rect', { uuid: 'test-006' }),
          createElement('circle', { uuid: 'test-007' }),
          createElement('text', {
            uuid: 'test-008',
            detail: {
              text: 'Text in Group'
            }
          }),
          createElement('image', { uuid: 'test-009', detail: { src: 'https://example.com/002.png' } })
        ]
      }
    })
  ]
});

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('modifyElement', () => {
    const data = createData();
    const div = document.createElement('div') as HTMLDivElement;

    const idraw = new iDraw(div, {
      height: 200,
      width: 200
    });
    const { MiddlewareHistory, historyHandler } = useHistory({ core: idraw.getCore() });
    const { undo, redo, __getDoRecords, __getUndoRecords } = historyHandler;
    idraw.use(MiddlewareHistory);
    idraw.setData(data);
    const targetElement = deepClone(data.elements[0]);

    // modify 1: do
    const modifiedInfo1 = {
      x: targetElement.x + 1,
      y: targetElement.y + 2,
      detail: {
        background: '#123456',
        borderRadius: 3
      }
    };
    idraw.modifyElement({
      uuid: targetElement.uuid,
      ...deepClone(modifiedInfo1)
    });
    const expectedData1 = createData();
    const flattenModifiedInfo1 = toFlattenElement(modifiedInfo1);
    const beforeInfo1: Record<string, any> = {};
    const afterInfo1 = { ...flattenModifiedInfo1 };
    Object.keys(flattenModifiedInfo1).forEach((key) => {
      beforeInfo1[key] = get(expectedData1.elements[0], key);
      set(expectedData1.elements[0], key, flattenModifiedInfo1[key]);
    });
    const record1 = {
      type: 'modifyElement',
      time: new Date().getTime(),
      content: {
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: beforeInfo1,
        after: afterInfo1
      }
    };
    expect(idraw.getData()).toStrictEqual(expectedData1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const modifiedInfo2 = {
      x: modifiedInfo1.x + 3,
      y: modifiedInfo1.y + 4,
      detail: {
        borderRadius: [2, 4, 6, 8]
      }
    } as unknown as RecursivePartial<Omit<Element, 'uuid'>>;

    idraw.modifyElement({
      uuid: targetElement.uuid,
      ...deepClone(modifiedInfo2)
    } as RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>);

    const expectedData2 = deepClone(expectedData1);
    const flattenModifiedInfo2 = toFlattenElement(modifiedInfo2);
    const beforeInfo2: Record<string, any> = {};
    const afterInfo2 = { ...flattenModifiedInfo2 };

    Object.keys(flattenModifiedInfo2).forEach((key) => {
      let beforeVal = get(expectedData1.elements[0], key);
      let beforeKey = key;
      if (beforeVal === undefined && /(borderRadius|borderWidth)\[[0-9]{1,}\]$/.test(beforeKey)) {
        beforeKey = beforeKey.replace(/\[[0-9]{1,}\]$/, '');
        beforeVal = get(expectedData1.elements[0], beforeKey);
      }
      beforeInfo2[beforeKey] = beforeVal;
      set(expectedData2.elements[0], key, flattenModifiedInfo2[key]);
    });
    const record2 = {
      type: 'modifyElement',
      time: new Date().getTime(),
      content: {
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: beforeInfo2,
        after: afterInfo2
      }
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
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: deepClone(record2.content.after),
        after: deepClone(record2.content.before)
      }
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
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: deepClone(record1.content.after),
        after: deepClone(record1.content.before)
      }
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
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: deepClone(record4.content.after),
        after: deepClone(record4.content.before)
      }
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
        method: 'modifyElement',
        uuid: targetElement.uuid,
        before: deepClone(record3.content.after),
        after: deepClone(record3.content.before)
      }
    };
    expect(idraw.getData()).toStrictEqual(expectedData2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
