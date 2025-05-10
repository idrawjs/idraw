import { iDraw, useHistory, deepClone, createElement, findElementFromListByPosition } from 'idraw';
import type { Element } from 'idraw';

const createData = () => ({
  elements: [
    createElement('rect', {
      uuid: 'test-000',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        background: '#DDDDDD'
      }
    }),
    createElement('group', {
      uuid: 'test-001',
      detail: {
        children: [
          createElement('image', { uuid: 'test-001-000', detail: { src: 'https://example.com/001.png' } }),
          createElement('circle', { uuid: 'test-001-001' }),
          createElement('text', {
            uuid: 'test-001-002',
            detail: {
              text: 'Text in Group'
            }
          }),
          createElement('image', { uuid: 'test-001-003', detail: { src: 'https://example.com/002.png' } }),
          createElement('rect', { uuid: 'test-001-004' }),
          createElement('circle', { uuid: 'test-001-005' })
        ]
      }
    })
  ]
});

describe('idraw: useHistory ', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('updateElement', () => {
    const data = createData();
    const div = document.createElement('div') as HTMLDivElement;

    const idraw = new iDraw(div, {
      height: 200,
      width: 200
    });
    const { MiddlewareHistory, history } = useHistory({ instance: idraw });
    const { undo, redo, __getDoRecords, __getUndoRecords } = history;
    idraw.use(MiddlewareHistory);
    idraw.setData(data);

    const position = [1, 2];
    const nextPosition = [1, 3];

    // modify 1: do
    const deletedElem1 = deepClone(findElementFromListByPosition(position, data.elements) as Element);
    const expectedElem1 = deepClone(findElementFromListByPosition(nextPosition, data.elements) as Element);
    idraw.deleteElement(deletedElem1?.uuid);
    const record1 = {
      type: 'deleteElement',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: deletedElem1.uuid,
        position: [...position],
        element: deepClone(deletedElem1)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(expectedElem1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const deletedElem2 = deepClone(findElementFromListByPosition(position, data.elements) as Element);
    const expectedElem2 = deepClone(findElementFromListByPosition(nextPosition, data.elements) as Element);
    idraw.deleteElement(deletedElem2?.uuid);
    const record2 = {
      type: 'deleteElement',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: deletedElem2.uuid,
        position: [...position],
        element: deepClone(deletedElem2)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(expectedElem2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'addElement',
        uuid: record2.content.uuid,
        position: deepClone(record2.content.position),
        element: deepClone(record2.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(deletedElem2);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'addElement',
        uuid: record1.content.uuid,
        position: deepClone(record1.content.position),
        element: deepClone(record1.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(deletedElem1);
    expect(__getDoRecords()).toStrictEqual([]);
    expect(__getUndoRecords()).toStrictEqual([record3, record4]);

    // modify 5: redo
    redo();
    const record5 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: record4.content.uuid,
        position: record4.content.position,
        element: deepClone(record4.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(expectedElem1);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 5: redo
    redo();
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: record3.content.uuid,
        position: record3.content.position,
        element: deepClone(record3.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(expectedElem2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
