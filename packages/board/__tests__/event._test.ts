// // TODO

// import Board from '../src';
// import { getData } from './data';

// const opts = {
//   width: 600,
//   height: 400,
//   contextWidth: 600,
//   contextHeight: 400,
//   devicePixelRatio: 4
// }

// test('@idraw/board: event.on("scale")', async () => {  
//   document.body.innerHTML = `
//     <div id="mount"></div>
//   `;
//   const mount = document.querySelector('#mount') as HTMLDivElement;
//   const board = new Board(mount, opts);
  
//   const data = await execBoard(board, opts);
//   const salceNum = 2
//   expect(data).toBe(salceNum);
// });


// function execBoard(board: Board, opts: any): Promise<any> {
//   return new Promise((resolve) => {
//     const data = getData();
//     const ctx = board.getContext();
//     board.clear();
//     ctx.clearRect(0, 0, opts.width, opts.height);
//     ctx.setFillStyle('#ffffff');
//     ctx.fillRect(0, 0, opts.width, opts.height);
//     data.elements.forEach(ele => {
//       ctx.setFillStyle(ele.desc.color);
//       ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
//     });

//     // board.on('scale', (scaleNum) => {
//     //   resolve(scaleNum);
//     // })
//     board.scale(2);
//     board.scrollX(-600);
//     board.scrollY(-400);
//     board.draw();
//   })
// }