import type { Data, Element, ModifiedElement } from '@idraw/types';
import { deepClone } from '@idraw/util';
import { ModifyRecorder } from '../../src/lib/modify-recorder';
import { imageBase64, html, svg } from '../_assets/base';

const originData: Data = {
  elements: [
    {
      uuid: 'b37213ce-d711-cbb3-51ac-d8081c19f127',
      type: 'rect',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        background: '#A0A0A0'
      }
    },
    {
      uuid: '39308517-e10f-76df-43a9-50ed7295e61e',
      type: 'circle',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        background: '#B0B0B0'
      }
    },
    {
      uuid: 'ef934ab7-a32e-040c-9ac0-ed193405e6e4',
      type: 'text',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        text: 'Hello World'
      }
    },
    {
      uuid: '063e3a80-1ede-7912-f919-975e34a9bd01',
      type: 'group',
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      detail: {
        children: [
          {
            uuid: '76a9bc55-6400-5aff-3147-d6c9b0d68753',
            type: 'rect',
            x: 10,
            y: 20,
            w: 100,
            h: 100,
            detail: {
              background: '#C0C0C0'
            }
          },
          {
            uuid: 'e0889472-1f16-d6cd-3c7a-4b827d52279d',
            type: 'image',
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            detail: {
              src: imageBase64
            }
          },
          {
            uuid: 'b60e64e8-833e-e112-d7eb-1ab6e7d6870c',
            type: 'svg',
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            detail: {
              svg: svg
            }
          },
          {
            uuid: '61f2a61e-cdd5-ae36-983f-686ba8e35973',
            type: 'html',
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            detail: {
              html: html
            }
          }
        ]
      }
    }
  ]
};

describe('ModifyRecorder', () => {
  let dateSpy: any;
  const mockTime = Date.parse('2024-01-01');

  beforeAll(() => {
    dateSpy = jest.spyOn(global.Date, 'now').mockImplementation(() => mockTime);
  });

  afterAll(() => {
    dateSpy.mockRestore();
  });

  test('do-undo-redo addElement', () => {
    const data = deepClone(originData);
    const recorder = new ModifyRecorder({ recordable: true });
    const elem: Element<'rect'> = {
      uuid: '2d2c5333-352d-7734-9ad6-53faa0ba36fc',
      type: 'rect',
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      detail: {
        background: 'red'
      }
    };
    let resultData: Data | null = null;
    // do
    {
      resultData = recorder.do(data, {
        type: 'addElement',
        content: {
          position: [1],
          element: deepClone(elem)
        }
      });
      const expectData = deepClone(originData);
      expectData.elements.splice(1, 0, deepClone(elem));
      expect(resultData).toStrictEqual(expectData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [1],
          element: deepClone(elem),
          type: 'addElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }

    // undo
    {
      resultData = recorder.undo(resultData as unknown as Data);
      expect(resultData).toStrictEqual(originData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([]);
      const unRecords = recorder.$getUndoStack();
      expect(unRecords).toStrictEqual([
        {
          position: [1],
          element: deepClone(elem),
          type: 'addElement',
          time: mockTime
        }
      ]);
    }

    // redo
    {
      resultData = recorder.redo(resultData as unknown as Data);
      const expectData = deepClone(originData);
      expectData.elements.splice(1, 0, deepClone(elem));
      expect(resultData).toStrictEqual(expectData);

      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [1],
          element: deepClone(elem),
          type: 'addElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }
  });

  test('do-undo-redo updateElement', () => {
    const data = deepClone(originData);
    const recorder = new ModifyRecorder({ recordable: true });
    const targetElem: Element<'rect'> = (data.elements?.[3] as Element<'group'>).detail.children[0] as Element<'rect'>;

    const beforeElem: ModifiedElement = {
      x: targetElem.x,
      y: targetElem.y,
      w: targetElem.w,
      h: targetElem.h,
      detail: {
        background: targetElem.detail.background
      }
    };

    const afterElem: ModifiedElement = {
      x: 5,
      y: 15,
      w: 25,
      h: 35,
      detail: {
        background: 'red'
      }
    };

    let resultData: Data | null = null;
    // do
    {
      resultData = recorder.do(data, {
        type: 'updateElement',
        content: {
          position: [3, 0],
          beforeModifiedElement: deepClone(beforeElem),
          afterModifiedElement: deepClone(afterElem)
        }
      });
      const expectData = deepClone(originData);
      const expectTargetElem: Element<'rect'> = (expectData.elements?.[3] as Element<'group'>).detail.children[0] as Element<'rect'>;
      expectTargetElem.x = afterElem.x as number;
      expectTargetElem.y = afterElem.y as number;
      expectTargetElem.w = afterElem.w as number;
      expectTargetElem.h = afterElem.h as number;
      expectTargetElem.detail.background = (afterElem as Element<'rect'>).detail.background as string;
      expect(resultData).toStrictEqual(expectData);

      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [3, 0],
          beforeModifiedElement: deepClone(beforeElem),
          afterModifiedElement: deepClone(afterElem),
          type: 'updateElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }

    // undo
    {
      resultData = recorder.undo(resultData as unknown as Data);
      const expectData = deepClone(originData);
      expect(resultData).toStrictEqual(expectData);

      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([]);

      const unRecords = recorder.$getUndoStack();
      expect(unRecords).toStrictEqual([
        {
          position: [3, 0],
          beforeModifiedElement: deepClone(beforeElem),
          afterModifiedElement: deepClone(afterElem),
          type: 'updateElement',
          time: mockTime
        }
      ]);
    }

    // redo
    {
      resultData = recorder.redo(resultData as unknown as Data);
      const expectData = deepClone(originData);
      const expectTargetElem: Element<'rect'> = (expectData.elements?.[3] as Element<'group'>).detail.children[0] as Element<'rect'>;
      expectTargetElem.x = afterElem.x as number;
      expectTargetElem.y = afterElem.y as number;
      expectTargetElem.w = afterElem.w as number;
      expectTargetElem.h = afterElem.h as number;
      expectTargetElem.detail.background = (afterElem as Element<'rect'>).detail.background as string;
      expect(resultData).toStrictEqual(expectData);

      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [3, 0],
          beforeModifiedElement: deepClone(beforeElem),
          afterModifiedElement: deepClone(afterElem),
          type: 'updateElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }
  });

  test('do-undo-redo deleteElement', () => {
    const data = deepClone(originData);
    const recorder = new ModifyRecorder({ recordable: true });
    const targetElem: Element<'rect'> = (data.elements?.[3] as Element<'group'>).detail.children[0] as Element<'rect'>;
    let resultData: Data | null = null;
    // do
    {
      resultData = recorder.do(data, {
        type: 'deleteElement',
        content: {
          position: [3, 0],
          element: deepClone(targetElem)
        }
      });
      const expectData = deepClone(originData);
      (expectData.elements?.[3] as Element<'group'>).detail.children.splice(0, 1);
      expect(resultData).toStrictEqual(expectData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [3, 0],
          element: deepClone(targetElem),
          type: 'deleteElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }

    // undo
    {
      resultData = recorder.undo(resultData as unknown as Data);
      expect(resultData).toStrictEqual(originData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([]);
      const unRecords = recorder.$getUndoStack();
      expect(unRecords).toStrictEqual([
        {
          position: [3, 0],
          element: deepClone(targetElem),
          type: 'deleteElement',
          time: mockTime
        }
      ]);
    }

    // redo
    {
      resultData = recorder.redo(resultData as unknown as Data);
      const expectData = deepClone(originData);
      (expectData.elements?.[3] as Element<'group'>).detail.children.splice(0, 1);
      expect(resultData).toStrictEqual(expectData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          position: [3, 0],
          element: deepClone(targetElem),
          type: 'deleteElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }
  });

  test('do-undo-redo moveElement', () => {
    const data = deepClone(originData);
    const recorder = new ModifyRecorder({ recordable: true });
    let resultData: Data | null = null;
    // const targetElem: Element<'rect'> = (data.elements?.[3] as Element<'group'>).detail.children[0] as Element<'rect'>;

    // do
    {
      resultData = recorder.do(data, {
        type: 'moveElement',
        content: {
          from: [3, 0],
          to: [1]
        }
      });
      const expectData = deepClone(originData);
      const [fromElem] = (expectData.elements?.[3] as Element<'group'>).detail.children.splice(0, 1);
      expectData.elements.splice(1, 0, fromElem);

      expect(resultData).toStrictEqual(expectData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          from: [3, 0],
          to: [1],
          afterModifiedFrom: [4, 0],
          afterModifiedTo: [1],
          type: 'moveElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }

    // undo
    {
      resultData = recorder.undo(resultData as unknown as Data);
      expect(resultData).toStrictEqual(originData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([]);
      const unRecords = recorder.$getUndoStack();
      expect(unRecords).toStrictEqual([
        {
          from: [3, 0],
          to: [1],
          afterModifiedFrom: [4, 0],
          afterModifiedTo: [1],
          type: 'moveElement',
          time: mockTime
        }
      ]);
    }

    // redo
    {
      resultData = recorder.redo(resultData as unknown as Data);
      const expectData = deepClone(originData);
      const [fromElem] = (expectData.elements?.[3] as Element<'group'>).detail.children.splice(0, 1);
      expectData.elements.splice(1, 0, fromElem);

      expect(resultData).toStrictEqual(expectData);
      const doRecords = recorder.$getDoStack();
      expect(doRecords).toStrictEqual([
        {
          from: [3, 0],
          to: [1],
          afterModifiedFrom: [4, 0],
          afterModifiedTo: [1],
          type: 'moveElement',
          time: mockTime
        }
      ]);
      const undoRecords = recorder.$getUndoStack();
      expect(undoRecords).toStrictEqual([]);
    }
  });
});
