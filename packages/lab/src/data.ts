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
    },
    {
      uuid: 'text-0010',
      name: 'text-002',
      x: 300,
      y: 100,
      w: 100,
      h: 60,
      type: 'text',
      desc: {
        fontSize: 16,
        text: [0, 1, 2, 3, 4].map((i) => `Hello Text ${i}`).join('\r\n'),
        // text: [0, 1, 2, 3, 4].map(i => `Hello Text ${i}`).join(''),
        fontWeight: 'bold',
        color: '#666666',
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#ff5722'
      }
    },
    {
      uuid: 'xxx-0011',
      type: 'svg',
      x: 400,
      y: 100,
      w: 100,
      h: 100,
      desc: {
        svg: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M336 421m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z" ></path><path d="M688 421m-48 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0Z" ></path><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m263 711c-34.2 34.2-74 61-118.3 79.8C611 874.2 562.3 884 512 884c-50.3 0-99-9.8-144.8-29.2-44.3-18.7-84.1-45.6-118.3-79.8-34.2-34.2-61-74-79.8-118.3C149.8 611 140 562.3 140 512s9.8-99 29.2-144.8c18.7-44.3 45.6-84.1 79.8-118.3 34.2-34.2 74-61 118.3-79.8C413 149.8 461.7 140 512 140c50.3 0 99 9.8 144.8 29.2 44.3 18.7 84.1 45.6 118.3 79.8 34.2 34.2 61 74 79.8 118.3C874.2 413 884 461.7 884 512s-9.8 99-29.2 144.8c-18.7 44.3-45.6 84.1-79.8 118.2z"></path><path d="M664 533h-48.1c-4.2 0-7.8 3.2-8.1 7.4C604 589.9 562.5 629 512 629s-92.1-39.1-95.8-88.6c-0.3-4.2-3.9-7.4-8.1-7.4H360c-4.6 0-8.2 3.8-8 8.4 4.4 84.3 74.5 151.6 160 151.6s155.6-67.3 160-151.6c0.2-4.6-3.4-8.4-8-8.4z" ></path></svg>`
      }
    },
    {
      uuid: 'xxx-0012',
      x: 400,
      y: 200,
      w: 150,
      h: 100,
      type: 'html',
      angle: 0,
      desc: {
        html: `
          <style>
          .btn-box {
            margin: 10px 0;
          }
          .btn {
            line-height: 1.5715;
            position: relative;
            display: inline-block;
            font-weight: 400;
            white-space: nowrap;
            text-align: center;
            background-image: none;
            border: 1px solid transparent;
            box-shadow: 0 2px #00000004;
            cursor: pointer;
            user-select: none;
            height: 32px;
            padding: 4px 15px;
            font-size: 14px;
            border-radius: 2px;
            color: #000000d9;
            background: #fff;
            border-color: #d9d9d9;
          }
          .btn-primary {
            color: #fff;
            background: #1890ff;
            border-color: #1890ff;
            text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
            box-shadow: 0 2px #0000000b;
          }
          </style>
          <div>
            <div class="btn-box">
              <button class="btn">
                <span> Hello &nbsp; Button</span>
              </button>
            </div>
            <div class="btn-box">
              <button class="btn btn-primary">
                <span>Button Primary</span>
              </button>
            </div>
          </div>
        `
      }
    },
    {
      uuid: 'group-001',
      x: 400,
      y: 400,
      w: 100,
      h: 100,
      type: 'group',
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
      uuid: 'group-003',
      x: 550,
      y: 50,
      w: 173.20508075688775,
      // w: 100,
      h: 100,
      angle: 30,
      type: 'group',
      desc: {
        children: [
          {
            uuid: 'group-003-014',
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
            uuid: 'group-003-0015',
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
            uuid: 'group-003-0016',
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
            uuid: 'group-003-0017',
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
            uuid: 'group-003-0018',
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
      uuid: 'xxxx-0017',
      type: 'image',
      x: 100,
      y: 300,
      w: 100,
      h: 100,
      angle: 30,
      desc: {
        src: './images/lena.png?v=0017'
      }
    },
    {
      uuid: 'group-004',
      x: 550,
      y: 250,
      w: 375,
      h: 400,
      type: 'group',
      desc: {
        bgColor: '#FFFFFF',
        children: [
          {
            uuid: 'groud-004-001',
            type: 'image',
            x: 200,
            y: 200,
            w: 100,
            h: 100,
            angle: 30,
            desc: {
              src: './images/lena.png'
            }
          },
          {
            uuid: 'groud-004-002',
            type: 'group',
            x: 50,
            y: 50,
            w: 200,
            h: 200,
            angle: 30,
            desc: {
              bgColor: '#f0f0f0',
              children: [
                {
                  uuid: 'group-004-002-014',
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
                  uuid: 'group-004-001-0015',
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
                  uuid: 'group-004-002-0016',
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
                  uuid: 'group-004-002-0017',
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
                  uuid: 'group-004-002-0018',
                  type: 'circle',
                  x: 40,
                  y: 0,
                  w: 100,
                  h: 100,
                  desc: {
                    bgColor: '#4caf50'
                  }
                },
                {
                  uuid: 'groud-004-002-xxxx',
                  type: 'group',
                  x: 50,
                  y: 100,
                  w: 200,
                  h: 100,
                  angle: 30,
                  desc: {
                    bgColor: '#666666',
                    children: [
                      {
                        uuid: 'group-004-002-xxx-014',
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
                        uuid: 'group-004-002-xxx-0015',
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
                        uuid: 'group-004-002-xxx-0016',
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
                        uuid: 'group-004-002-xxx-0017',
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
                        uuid: 'group-004-002-xxx-0018',
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
              ]
            }
          }
        ]
      }
    }
  ]
};

export function getData() {
  return deepClone(data);
}
