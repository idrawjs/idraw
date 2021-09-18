import Context2d from './../../src/lib/context-2d';

describe('@idraw/kernal: lib/context-2d', () => {

  test('Context2d.globalAlpha', async () => {  
    const globalAlpha = 0.55;
    const ctx2d = new Context2d();
    ctx2d.globalAlpha = globalAlpha;
    expect(ctx2d.globalAlpha).toStrictEqual(globalAlpha);
    expect(ctx2d.$getAllAttrs()).toStrictEqual({ globalAlpha });
    expect(ctx2d.$getAllRecords()).toStrictEqual([ { name: 'globalAlpha', type: 'attr', args: [ globalAlpha ] } ]);
  });

  test('Context2d.globalCompositeOperation', async () => {  
    const globalCompositeOperation = 'source-over';
    const ctx2d = new Context2d();
    ctx2d.globalCompositeOperation = globalCompositeOperation;
    expect(ctx2d.globalCompositeOperation).toStrictEqual(globalCompositeOperation);
    expect(ctx2d.$getAllAttrs()).toStrictEqual({ globalCompositeOperation });
    expect(ctx2d.$getAllRecords()).toStrictEqual([ { name: 'globalCompositeOperation', type: 'attr', args: [ globalCompositeOperation ] } ]);
  });


  test('Context2d.drawImage', async () => {  
    const ctx2d = new Context2d();
    const img = new Image();
    const dx = 11;
    const dy = 12;
    const dw = 51;
    const dh = 52;
    const sx = 61;
    const sy = 62;
    const sw = 101
    const sh = 102;
    ctx2d.drawImage(img, dx, dy);
    ctx2d.drawImage(img, dx, dy, dw, dh);
    ctx2d.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    expect(ctx2d.$getAllRecords()).toStrictEqual([{
      name: 'drawImage',
      type: 'method',
      args: [img, dx, dy]
    },
    {
      name: 'drawImage',
      type: 'method',
      args: [img, dx, dy, dw, dh]
    },
    {
      name: 'drawImage',
      type: 'method',
      args: [img, sx, sy, sw, sh, dx, dy, dw, dh]
    }]);
  });
})

