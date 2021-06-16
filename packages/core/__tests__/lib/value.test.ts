import { limitNum, limitAngle } from './../../src/lib/value';

describe("./lib/value", () => {

  test('limitNum', () => {

    const num1 = limitNum(1 / 3);
    expect(num1).toStrictEqual(0.33);

    const num2 = limitNum(1 / 6);
    expect(num2).toStrictEqual(0.17);

    const num3 = limitNum(1234 * 1);
    expect(num3).toStrictEqual(1234);

  });


  test('limitAngle', () => {

    const num1 = limitAngle(372);
    expect(num1).toStrictEqual(12);

    const num2 = limitAngle(-372);
    expect(num2).toStrictEqual(-12);

    const num3 = limitAngle(-372.3333333);
    expect(num3).toStrictEqual(-12.33);

    const num4 = limitAngle(372.66666666);
    expect(num4).toStrictEqual(12.67);
  });
})