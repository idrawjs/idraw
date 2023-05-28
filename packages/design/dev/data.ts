import { createUUID } from '@idraw/util';
import type { DesignData } from '../src';

const data: DesignData = {
  components: [
    {
      uuid: createUUID(),
      type: 'component',
      name: 'Button default',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      desc: {
        bgColor: '#1f1f1f',
        children: [
          {
            uuid: createUUID(),
            type: 'circle',
            x: -40,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#f44336'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: -20,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#ff9800'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#ffc106'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 20,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#cddc39'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 40,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#4caf50'
            }
          }
        ]
      }
    },
    {
      uuid: createUUID(),
      type: 'component',
      name: 'Button primary',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      desc: {
        bgColor: '#f0f0f0',
        children: [
          {
            uuid: createUUID(),
            type: 'circle',
            x: -40,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#f44336'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: -20,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#ff9800'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#ffc106'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 20,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#cddc39'
            }
          },
          {
            uuid: createUUID(),
            type: 'circle',
            x: 40,
            y: 0,
            w: 100,
            h: 100,
            desc: {
              bgColor: '#4caf50'
            }
          }
        ]
      }
    }
  ],
  modules: [],
  pages: []
};

export default data;
