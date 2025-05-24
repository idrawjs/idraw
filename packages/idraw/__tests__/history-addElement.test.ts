import { iDraw, useHistory, deepClone, createElement, findElementFromListByPosition } from 'idraw';

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
    createElement('group', {
      uuid: 'test-005',
      detail: {
        children: [
          createElement('image', { uuid: 'test-004', detail: { src: 'https://example.com/001.png' } }),
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

  test('updateElement', () => {
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

    // modify 1: do
    const newElement1 = idraw.createElement('rect', {
      x: 22,
      y: 33,
      h: 300,
      w: 400,
      name: 'new element 001',
      detail: {
        background: '#666666'
      }
    });
    const position = [1, 2];
    idraw.addElement(newElement1, {
      position
    });
    const record1 = {
      type: 'addElement',
      time: new Date().getTime(),
      content: {
        method: 'addElement',
        uuid: newElement1.uuid,
        position: [...position],
        element: deepClone(newElement1)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(newElement1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 2: do
    const newElement2 = idraw.createElement('text', {
      x: 22,
      y: 33,
      h: 300,
      w: 400,
      name: 'new element 002',
      detail: {
        text: 'Hello Element'
      }
    });
    idraw.addElement(newElement2, { position });
    const record2 = {
      type: 'addElement',
      time: new Date().getTime(),
      content: {
        method: 'addElement',
        uuid: newElement2.uuid,
        position: [...position],
        element: deepClone(newElement2)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(newElement2);
    expect(__getDoRecords()).toStrictEqual([record1, record2]);
    expect(__getUndoRecords()).toStrictEqual([]);

    // modify 3: undo
    undo();
    const record3 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: record2.content.uuid,
        position: deepClone(record2.content.position),
        element: deepClone(record2.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(newElement1);
    expect(__getDoRecords()).toStrictEqual([record1]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 4: undo
    undo();
    const record4 = {
      type: 'undo',
      time: new Date().getTime(),
      content: {
        method: 'deleteElement',
        uuid: record1.content.uuid,
        position: deepClone(record1.content.position),
        element: deepClone(record1.content.element)
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
        method: 'addElement',
        uuid: record4.content.uuid,
        position: record4.content.position,
        element: deepClone(record4.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(newElement1);
    expect(__getDoRecords()).toStrictEqual([record5]);
    expect(__getUndoRecords()).toStrictEqual([record3]);

    // modify 5: redo
    redo();
    const record6 = {
      type: 'redo',
      time: new Date().getTime(),
      content: {
        method: 'addElement',
        uuid: record3.content.uuid,
        position: record3.content.position,
        element: deepClone(record3.content.element)
      }
    };
    expect(findElementFromListByPosition(position, idraw.getData()?.elements || [])).toStrictEqual(newElement2);
    expect(__getDoRecords()).toStrictEqual([record5, record6]);
    expect(__getUndoRecords()).toStrictEqual([]);
  });
});
