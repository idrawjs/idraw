import IDraw from '../../src';

describe('@idraw/core', () => {

  document.body.innerHTML = `
    <div id="mount"></div>
  `;
  const opts = {
    width: 800,
    height: 600,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4,
    canScroll: true,
  };
  const transform = {
    scale: 2,
    scrollX: -200,
    scrollY: -100,
  };
  const mount = document.querySelector('#mount') as HTMLDivElement;
  const idraw = new IDraw(mount, opts);

  idraw.scale(transform.scale);
  idraw.scrollX(transform.scrollX);
  idraw.scrollY(transform.scrollY);

  const p1 = {x: 400, y: 300};
  const p2 = {x: 300, y: 200};

  test('pointScreenToContext', async () => {
    expect(idraw.pointScreenToContext(p1)).toStrictEqual(p2);
  });

  test('pointContextToScreen', async () => {
    expect(idraw.pointContextToScreen(p2)).toStrictEqual(p1);
  });

});

