import Context2d from './../../src/lib/context-2d/index';

describe('@idraw/kernal: lib/context-2d', () => {
  test('Context2d.globalAlpha', async () => {  
    const globalAlpha = 0.55;
    const ctx2d = new Context2d();
    ctx2d.globalAlpha = globalAlpha;
    expect(ctx2d.globalAlpha).toStrictEqual(globalAlpha);
    expect(ctx2d.$getAllAttrs()).toStrictEqual({ globalAlpha });
    expect(ctx2d.$getAllRecords()).toStrictEqual([ { name: 'globalAlpha', type: 'attr', args: [ 0.55 ] } ]);
  });
})

