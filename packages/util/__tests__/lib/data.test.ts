import {
  deepClone
} from '../../src/lib/data';


describe('@idraw/util: lib/data', () => {
  const json = {
    num: 123,
    str: 'abc',
    bool: true,
    arr: [
      {
        num: 1,
        str: 'a',
        bool: false,
      },
      {
        num: 2,
        str: 'b',
        bool: false,
      }
    ],
    json: {
      num: 10,
      str: 'aaaa',
      bool: false,
      json: {
        num: 11,
        str: 'bbbb',
        bool: false,
      }
    }
  }

  const json2 = deepClone(json);
  json2.json.json.num *= 2;

  test('deepClone', async () => {
    const result = deepClone(json);
    result.json.json.num *= 2;
    expect(result).toStrictEqual(json2);
  });

  

});

