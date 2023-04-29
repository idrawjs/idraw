import type { Data } from '@idraw/types';
import { deepClone } from '@idraw/util';

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
      desc: {
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
      desc: {
        bgColor: '#f44336'
      }
    },
    {
      uuid: 'xxx-0002',
      type: 'rect',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      desc: {
        bgColor: '#2196f3'
      }
    },
    {
      uuid: 'xxx-0004',
      type: 'image',
      x: 250,
      y: 250,
      w: 100,
      h: 100,
      desc: {
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
      desc: {
        bgColor: '#009688'
      }
    },
    {
      uuid: 'xxxx-0006',
      x: 300,
      y: 300,
      w: 100,
      h: 100,
      type: 'circle',
      desc: {
        bgColor: '#673ab7'
      }
    },
    {
      uuid: 'xxxx-0007',
      x: 300,
      y: 0,
      w: 100,
      h: 100,
      type: 'circle',
      desc: {
        bgColor: '#ffc107'
      }
    },
    {
      uuid: 'xxxx-0008',
      x: 150,
      y: 150,
      w: 100,
      h: 100,
      type: 'circle',
      desc: {
        bgColor: '#4caf50'
      }
    },
    {
      uuid: 'xxxx-0009',
      x: 0,
      y: 150,
      w: 100,
      h: 100,
      type: 'circle',
      desc: {
        bgColor: '#ff9800'
      }
    },
    {
      uuid: 'xxxx-0010',
      x: 150,
      y: 50,
      w: 100,
      h: 100,
      type: 'circle',
      desc: {
        bgColor: '#cddc39'
      }
    }
  ]
};

export function getData() {
  return deepClone(data);
}
