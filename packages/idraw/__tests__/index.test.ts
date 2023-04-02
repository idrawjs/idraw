import { requestAnimationFrameMock } from './../../../__tests__/polyfill/requestanimateframe';
import './../../../__tests__/polyfill/image';

import IDraw from './../src';
import { getData } from './data';

function delay(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

describe('idraw', () => {
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  test('context', async () => {
    document.body.innerHTML = `
      <div id="mount"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 600,
      contextHeight: 400,
      devicePixelRatio: 4
    };
    const mount = document.querySelector('#mount') as HTMLDivElement;
    const idraw = new IDraw(mount, opts);
    const data = getData();
    idraw.setData(data, { triggerChangeEvent: true });

    requestAnimationFrameMock.triggerNextAnimationFrame();

    const originCtx = idraw.$getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();

    const displayCtx = idraw.$getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });

  test('undo/redo', async () => {
    document.body.innerHTML = `
      <div id="mount"></div>
    `;
    const opts = {
      width: 600,
      height: 400,
      contextWidth: 600,
      contextHeight: 400,
      devicePixelRatio: 4
    };
    const mount = document.querySelector('#mount') as HTMLDivElement;
    const idraw = new IDraw(mount, opts);
    const data = getData();
    idraw.setData(data, { triggerChangeEvent: true });
    idraw.moveDownElement('svg-004');
    idraw.moveDownElement('image-003');
    await delay(10);

    const undo1 = idraw.undo();
    expect(undo1.doRecordCount).toBe(2);
    expect(undo1.data?.elements?.length).toBe(4);

    const undo2 = idraw.undo();
    expect(undo2.doRecordCount).toBe(1);
    expect(undo2.data?.elements?.length).toBe(4);

    const redo1 = idraw.redo();
    expect(redo1.undoRecordCount).toBe(1);
    expect(redo1.data?.elements?.length).toBe(4);

    idraw.moveDownElement('image-003');

    const redo2 = idraw.redo();
    expect(redo2.undoRecordCount).toBe(0);
    expect(redo2.data).toBe(null);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    const originCtx = idraw.$getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();

    const displayCtx = idraw.$getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });
});
