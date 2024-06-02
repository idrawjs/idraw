import type { Data } from '@idraw/types';
import { createUUID, parseSVGPath } from '@idraw/util';

const data: Data = {
  elements: [
    // {
    //   uuid: createUUID(),
    //   type: 'image',
    //   x: 100,
    //   y: 100,
    //   w: 100,
    //   h: 100,
    //   angle: 30,
    //   detail: {
    //     // src: '/public/images/lena.png?t=002'
    //     src: '@assets/0ee02fb0-ec43-6b9a-9ab4-55be5816ca4a'
    //   },
    //   operations: {
    //     limitRatio: true
    //   }
    // },
    {
      uuid: createUUID(),
      x: 2,
      y: 2,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#f44336'
      }
    },
    {
      uuid: createUUID(),
      type: 'rect',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      detail: {
        background: '#8bc34a'
      }
    },
    // {
    //   uuid: createUUID(),
    //   type: 'image',
    //   x: 250,
    //   y: 250,
    //   w: 100,
    //   h: 100,
    //   detail: {
    //     // src: '/public/images/github.png?t=003'
    //     src: '@assets/25a0e630-a958-a522-29a4-5dccf04985da'
    //   }
    // },
    // {
    //   uuid: createUUID(),
    //   type: 'group',
    //   x: 250,
    //   y: 250,
    //   w: 100,
    //   h: 100,
    //   detail: {
    //     children: [
    //       {
    //         uuid: createUUID(),
    //         type: 'image',
    //         x: 0,
    //         y: 0,
    //         w: 100,
    //         h: 100,
    //         detail: {
    //           // src: '/public/images/github.png?t=003'
    //           src: '@assets/489c64d2-f642-3855-7bd6-cb40624b62c3'
    //         }
    //       }
    //     ],
    //     // assets: {
    //     //   '@assets/489c64d2-f642-3855-7bd6-cb40624b62c3': {
    //     //     type: 'image',
    //     //     value: '/public/images/github.png?t=003'
    //     //   }
    //     // }
    //   }
    // },
    {
      uuid: createUUID(),
      x: 0,
      y: 300,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#009688'
      }
    },
    {
      uuid: createUUID(),
      x: 300,
      y: 300,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#673ab7'
      }
    },
    {
      uuid: createUUID(),
      x: 300,
      y: 0,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#ffc107'
      }
    },
    {
      uuid: createUUID(),
      x: 150,
      y: 150,
      w: 100,
      h: 100,
      // angle: 30,
      type: 'rect',
      detail: {
        background: '#4caf50',
        clipPath: {
          commands: parseSVGPath(`
          M 10,30
          A 20,20 0,0,1 50,30
          A 20,20 0,0,1 90,30
          Q 90,60 50,90
          Q 10,60 10,30 z`),
          // fill: '#ff0000',
          originX: 10,
          originY: 10,
          originH: 80,
          originW: 80
          // background: '#0000002A'
        }
      }
    },
    {
      uuid: createUUID(),
      x: 100,
      y: 10,
      w: 80,
      h: 80,
      // angle: 30,
      type: 'path',
      detail: {
        commands: parseSVGPath(`
        M 10,30
        A 20,20 0,0,1 50,30
        A 20,20 0,0,1 90,30
        Q 90,60 50,90
        Q 10,60 10,30 z`),
        fill: 'red',
        originX: 10,
        originY: 10,
        originH: 80,
        originW: 80,
        background: '#0000002A'

        // clipPath: {
        //   commands: parseSVGPath(`
        //     M 10,30
        //     A 20,20 0,0,1 50,30
        //     A 20,20 0,0,1 90,30
        //     Q 90,60 50,90
        //     Q 10,60 10,30 z`),
        //   fill: '#ff0000',
        //   originX: 10,
        //   originY: 10,
        //   originH: 80,
        //   originW: 80
        // }
      }
    }
  ]
  // assets: {
  //   '@assets/0ee02fb0-ec43-6b9a-9ab4-55be5816ca4a': {
  //     type: 'image',
  //     value: '/public/images/lena.png?t=003'
  //   },
  //   '@assets/25a0e630-a958-a522-29a4-5dccf04985da': {
  //     type: 'image',
  //     value: '/public/images/github.png?t=002'
  //   }
  // }
};

export default data;
