import util from '../src';

const types = {
  time: 'Object',
  loader: 'Object',
  file: 'Object',
  color: 'Object',
  uuid: 'Object',
  istype: 'Object',
  data: 'Object',
}

function getType (data: any): string {
  const typeStr = Object.prototype.toString.call(data) || '';
  const result = typeStr.replace(/(\[object|\])/ig, '').trim();
  return result;
}


describe('@idraw/util', () => {

  test('index', async () => {
    const keys = Object.keys(util);
    keys.forEach((key) => {
      // @ts-ignore
      const type = getType(util[key]);
      // @ts-ignore
      expect(type).toStrictEqual(types[key]);
    });
  });

});

