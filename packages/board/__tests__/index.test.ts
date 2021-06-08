import Board from './../src';

test('testing', async () => {  
  document.body.innerHTML = `
    <div id="mount"></div>
  `;
  const opts = {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4
  }
  const mount = document.querySelector('#mount') as HTMLDivElement;
  const board = new Board(mount, opts);

  const ctx = board.getContext();
  const data = {
    elements: [
      {
        x: 10,
        y: 10,
        w: 200,
        h: 120,
        type: 'rect',
        desc: {
          color: '#f0f0f0',
        }
      },
      {
        x: 80,
        y: 80,
        w: 200,
        h: 120,
        type: 'rect',
        desc: {
          color: '#cccccc',
        }
      },
      {
        x: 160,
        y: 160,
        w: 200,
        h: 120,
        type: 'rect',
        desc: {
          color: '#c0c0c0',
        }
      },
      {
        x: 400 - 10,
        y: 300 - 10,
        w: 200,
        h: 100,
        type: 'rect',
        desc: {
          color: '#e0e0e0',
        }
      }
    ]
  };

  board.clear();
  ctx.clearRect(0, 0, opts.width, opts.height);
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(0, 0, opts.width, opts.height);
  data.elements.forEach(ele => {
    ctx.setFillStyle(ele.desc.color);
    ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
  });
  board.draw();

  const originCtx = board.getOriginContext();
  // @ts-ignore;
  const originCalls = originCtx.__getDrawCalls();
  expect(originCalls).toMatchSnapshot();

  const displayCtx = board.getDisplayContext();
  // @ts-ignore;
  const displayCalls = displayCtx.__getDrawCalls();
  expect(displayCalls).toMatchSnapshot();

});