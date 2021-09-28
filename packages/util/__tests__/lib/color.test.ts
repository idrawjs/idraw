import {
  toColorHexNum,
  toColorHexStr,
  isColorStr
} from '../../src/lib/color';


describe('@idraw/util: lib/color', () => {
  const hex = '#f0f0f0';
  const num = 15790320;

  test('toColorHexNum', async () => {
    const result = toColorHexNum(hex);
    expect(result).toStrictEqual(num);
  });

  test('toColorHexStr', async () => {
    const result = toColorHexStr(num);
    expect(result).toStrictEqual(hex);
  });

  test('isColorStr', async () => {
    const result = isColorStr(hex);
    expect(result).toStrictEqual(true);
  });

});

