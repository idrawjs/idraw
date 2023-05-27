import type { DesignData } from '../src';

const data: DesignData = {
  components: [
    {
      uuid: 'demo-xxx-001',
      type: 'component',
      name: 'demo',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      desc: {
        bgColor: '#1f1f1f',
        children: [
          {
            uuid: 'group-001-0014',
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
            uuid: 'group-001-0015',
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
            uuid: 'group-001-0016',
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
            uuid: 'group-001-0017',
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
            uuid: 'group-001-0018',
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
      uuid: 'demo-xxx-002',
      type: 'component',
      name: 'demo',
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      desc: {
        bgColor: '#f0f0f0',
        children: [
          {
            uuid: 'group-001-0014',
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
            uuid: 'group-001-0015',
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
            uuid: 'group-001-0016',
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
            uuid: 'group-001-0017',
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
            uuid: 'group-001-0018',
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
