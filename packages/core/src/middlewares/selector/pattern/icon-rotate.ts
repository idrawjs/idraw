import type { Element } from '@idraw/types';
import { createUUID } from '@idraw/util';

export const createIconRotate = (opts?: { fill?: string }) => {
  const iconRotate: Element<'path'> = {
    uuid: createUUID(),
    type: 'path',
    x: 0,
    y: 0,
    w: 200,
    h: 200,
    detail: {
      commands: [
        {
          type: 'M',
          params: [512, 0]
        },
        {
          type: 'c',
          params: [282.8, 0, 512, 229.2, 512, 512]
        },
        {
          type: 's',
          params: [-229.2, 512, -512, 512]
        },
        {
          type: 'S',
          params: [0, 794.8, 0, 512, 229.2, 0, 512, 0]
        },
        {
          type: 'z',
          params: []
        },
        {
          type: 'm',
          params: [309.8, 253.8]
        },
        {
          type: 'c',
          params: [0, -10.5, -6.5, -19.8, -15.7, -23.8, -9.7, -4, -21, -2, -28.2, 5.6]
        },
        {
          type: 'l',
          params: [-52.5, 52]
        },
        {
          type: 'c',
          params: [
            -56.9, -53.7, -133.9, -85.5, -213.4, -85.5, -170.7, 0, -309.8, 139.2, -309.8, 309.8, 0, 170.6, 139.2, 309.8, 309.8, 309.8, 92.4, 0, 179.5, -40.8,
            238.4, -111.8, 4, -5.2, 4, -12.9, -0.8, -17.3
          ]
        },
        {
          type: 'L',
          params: [694.3, 637]
        },
        {
          type: 'c',
          params: [
            -2.8, -2.4, -6.5, -3.6, -10.1, -3.6, -3.6, 0.4, -7.3, 2, -9.3, 4.8, -39.5, 51.2, -98.8, 80.3, -163, 80.3, -113.8, 0, -206.5, -92.8, -206.5, -206.5,
            0, -113.8, 92.8, -206.5, 206.5, -206.5, 52.8, 0, 102.9, 20.2, 140.8, 55.3
          ]
        },
        {
          type: 'L',
          params: [597, 416.5]
        },
        {
          type: 'c',
          params: [-7.7, 7.3, -9.7, 18.6, -5.6, 27.9, 4, 9.7, 13.3, 16.1, 23.8, 16.1]
        },
        {
          type: 'H',
          params: [796]
        },
        {
          type: 'c',
          params: [14.1, 0, 25.8, -11.7, 25.8, -25.8]
        },
        {
          type: 'V',
          params: [253.8]
        },
        {
          type: 'z',
          params: []
        }
      ],
      fill: '#2c2c2c',
      stroke: 'transparent',
      strokeWidth: 0,
      originX: 0,
      originY: 0,
      originW: 1024,
      originH: 1024,
      opacity: 1,
      ...opts
    }
  };

  return iconRotate;
};
