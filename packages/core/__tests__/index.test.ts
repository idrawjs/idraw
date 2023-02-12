/* eslint-disable @typescript-eslint/ban-ts-comment */
import { requestAnimationFrameMock } from './../../../__tests__/polyfill/requestanimateframe';
import './../../../__tests__/polyfill/image';

import Core from './../src/';
import { getData } from './data';

describe('@idraw/core', () => {
  beforeEach(() => {
    requestAnimationFrameMock.reset();
  });

  test('@idraw/core: context', async () => {
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
    const core = new Core(mount, opts);
    const data = getData();
    core.setData(data);

    requestAnimationFrameMock.triggerNextAnimationFrame();

    const originCtx = core.__getOriginContext2D();
    // @ts-ignore;
    const originCalls = originCtx.__getDrawCalls();
    expect(originCalls).toMatchSnapshot();

    const displayCtx = core.__getDisplayContext2D();
    // @ts-ignore;
    const displayCalls = displayCtx.__getDrawCalls();
    expect(displayCalls).toMatchSnapshot();
  });
});
