import Core from './../../src';

describe("@idraw/core static check", () => {

  test('Core.check.attrs', () => {
    expect(Core.check.attrs({
      x: 0,
      y: 100,
      w: 200,
      h: 200,
      angle: 0
    })).toStrictEqual(true);

    expect(Core.check.attrs({
      x: 0,
      y: 100,
      w: -200,
      h: 200,
      angle: 0
    })).toStrictEqual(false);


    expect(Core.check.attrs({
      x: 0,
      y: 100,
      w: 200,
      h: 200,
      angle: -99999
    })).toStrictEqual(false);
  });

})