import {
  downloadImageFromCanvas
} from '../../src/lib/file';


describe('@idraw/util: lib/file', () => {
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const opts = {
    width: 600,
    height: 400,
  }
  ctx.clearRect(0, 0, opts.width, opts.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, opts.width / 2, opts.height / 2);

  test('downloadImageFromCanvas', async () => { 
    downloadImageFromCanvas(canvas, {
      filename: 'hello',
      type: 'image/png',
    }); 
    expect(canvas).toMatchSnapshot();
  });
  

});

