import type { Data } from '@idraw/types';
import { deepClone } from '@idraw/util';

// const data: Data = {
//   background: '#ffffff',
//   elements: [
//     {
//       name: 'rect-001',
//       x: 5,
//       y: 5,
//       w: 100,
//       h: 50,
//       type: 'rect',
//       detail: {
//         background: '#ffeb3b',
//         borderRadius: 10,
//         borderWidth: 5,
//         borderColor: '#ffc107'
//       }
//     },
//     {
//       name: 'text-002',
//       x: 40,
//       y: 40,
//       w: 100,
//       h: 60,
//       // angle: 30,
//       type: 'text',
//       detail: {
//         fontSize: 16,
//         text: 'Hello Text',
//         fontWeight: 'bold',
//         color: '#666666',
//         borderRadius: 30,
//         borderWidth: 4,
//         borderColor: '#ff5722'
//       }
//     },
//     {
//       name: 'image-003',
//       x: 80,
//       y: 80,
//       w: 160,
//       h: 80,
//       type: 'image',
//       detail: {
//         src: './images/computer.png'
//       },
//       operation: {
//         // disableRotate: true,
//         limitRatio: true
//       }
//     },
//     {
//       name: 'svg-004',
//       x: 200 - 5,
//       y: 150 - 50,
//       w: 100,
//       h: 100,
//       type: 'svg',
//       angle: 135,
//       detail: {
//         svg: '<svg t="1622524892065" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9337" width="200" height="200"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" p-id="9338"></path></svg>'
//       },
//       operation: {
//         // disableRotate: true,
//         limitRatio: true
//       }
//     },
//     {
//       name: 'text-002',
//       x: 200,
//       y: 200,
//       w: 300,
//       h: 100,
//       // angle: 30,
//       type: 'text',
//       detail: {
//         fontSize: 16,
//         // text: 'Hello Text Hello Text Hello Text Hello Text Hello Text Hello Text',
//         text: 'Hello Text',
//         fontWeight: 'bold',
//         color: '#666666',
//         borderRadius: 30,
//         borderWidth: 2,
//         borderColor: '#ff5722',
//         textAlign: 'center',
//         verticalAlign: 'middle'
//       }
//     }
//   ]
// };

const data: Data = {
  elements: [
    {
      uuid: 'xxx-0003',
      type: 'image',
      x: 100,
      y: 100,
      w: 100,
      h: 100,
      angle: 30,
      detail: {
        src: './images/lena.png'
      }
    },
    {
      uuid: 'xxxx-0001',
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
      uuid: 'xxx-0002',
      type: 'rect',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      detail: {
        background: '#2196f3'
      }
    },
    {
      uuid: 'xxx-0004',
      type: 'image',
      x: 250,
      y: 250,
      w: 100,
      h: 100,
      detail: {
        src: './images/github.png?t=003'
      }
    },
    {
      uuid: 'xxxx-0005',
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
      uuid: 'xxxx-0006',
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
      uuid: 'xxxx-0007',
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
      uuid: 'xxxx-0008',
      x: 150,
      y: 150,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#4caf50'
      }
    },
    {
      uuid: 'xxxx-0009',
      x: 0,
      y: 150,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#ff9800'
      }
    },
    {
      uuid: 'xxxx-0010',
      x: 150,
      y: 50,
      w: 100,
      h: 100,
      type: 'circle',
      detail: {
        background: '#cddc39'
      }
    }
  ]
};

// const data: Data = {
//   elements: [
//     {
//       uuid: 'xxxx-0005',
//       x: 300,
//       y: 300,
//       w: 100,
//       h: 100,
//       type: 'circle',
//       detail: {
//         background: '#009688'
//       }
//     }
//   ]
// };

export function getData() {
  return deepClone(data);
}
