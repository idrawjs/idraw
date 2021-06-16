import { TypeData } from '@idraw/types';
import Core from './../../src';
import { getData } from './../data';
import { Element } from './../../src/lib/element';

describe("./lib/element", () => {
  document.body.innerHTML = `
    <div id="mount"></div>
  `;
  const opts = {
    width: 600,
    height: 400,
    contextWidth: 600,
    contextHeight: 400,
    devicePixelRatio: 4
  }
  const mount = document.querySelector('#mount') as HTMLDivElement;
  const core = new Core(mount, opts);
  const ctx = core.__getBoardContext();
  const data = getData();

  test('initData', async () => {  
    const element = new Element(ctx);
    const newData = element.initData(data as TypeData);
    expect(newData.elements[0].uuid.length).toStrictEqual(36);
  });


});




