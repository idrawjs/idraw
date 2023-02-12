// import { TypeData } from '@idraw/types';
import Core from '../../src';

describe('@idraw/core: Element API', () => {
  document.body.innerHTML = `
    <div id="mount"></div>
  `;
  const opts = {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4
  };
  const mount = document.querySelector('#mount') as HTMLDivElement;
  const core = new Core(mount, opts);
  const data = {
    elements: [
      {
        name: 'rect-001',
        x: 10,
        y: 10,
        w: 200,
        h: 100,
        type: 'rect',
        desc: {
          bgColor: '#f0f0f0',
          borderRadius: 20,
          borderWidth: 10,
          borderColor: '#bd0b64'
        }
      },
      {
        name: 'text-002',
        x: 80,
        y: 80,
        w: 200,
        h: 120,
        // angle: 30,
        type: 'text',
        desc: {
          fontSize: 20,
          text: 'Hello Text',
          color: '#666666',
          borderRadius: 60,
          borderWidth: 2,
          borderColor: '#bd0b64'
        }
      },
      {
        name: 'text-003',
        x: 80,
        y: 80,
        w: 200,
        h: 120,
        // angle: 30,
        type: 'text',
        desc: {
          fontSize: 20,
          text: 'Hello Text',
          color: '#666666',
          borderRadius: 60,
          borderWidth: 2,
          borderColor: '#bd0b64'
        }
      }
    ]
  };
  core.setData(data);
  const _data = core.getData();

  test('getSelectedElements', async () => {
    core.selectElement(_data.elements[1].uuid || '');
    const elems = core.getSelectedElements();
    expect(elems).toStrictEqual([_data.elements[1]]);
  });

  test('getElement', async () => {
    const uuid = core.getData().elements[0]?.uuid;
    const elem = core.getElement(uuid);
    expect(elem).toStrictEqual(core.getData().elements[0]);
  });

  test('getElementByIndex', async () => {
    const index = 0;
    const elem = core.getElementByIndex(index);
    expect(elem).toStrictEqual(core.getData().elements[index]);
  });
});
