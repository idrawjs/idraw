import Core from './../../src';

describe("@idraw/core static is", () => {

  test('Core.is.number', () => {
    expect(Core.is.number(0)).toStrictEqual(true);
    expect(Core.is.number(100)).toStrictEqual(true);
    expect(Core.is.number(-100)).toStrictEqual(true);
    expect(Core.is.number('abc')).toStrictEqual(false);
  });

  test('Core.is.x', () => {
    expect(Core.is.x(0)).toStrictEqual(true);
    expect(Core.is.x(100)).toStrictEqual(true);
    expect(Core.is.x(-100)).toStrictEqual(true);
    expect(Core.is.x('abc')).toStrictEqual(false);
  });

  test('Core.is.y', () => {
    expect(Core.is.y(0)).toStrictEqual(true);
    expect(Core.is.y(100)).toStrictEqual(true);
    expect(Core.is.y(-100)).toStrictEqual(true);
    expect(Core.is.y('abc')).toStrictEqual(false);
  });

  test('Core.is.w', () => {
    expect(Core.is.w(0)).toStrictEqual(true);
    expect(Core.is.w(100)).toStrictEqual(true);
    expect(Core.is.w(-100)).toStrictEqual(false);
    expect(Core.is.w('abc')).toStrictEqual(false);
  });

  test('Core.is.h', () => {
    expect(Core.is.h(0)).toStrictEqual(true);
    expect(Core.is.h(100)).toStrictEqual(true);
    expect(Core.is.h(-100)).toStrictEqual(false);
    expect(Core.is.h('abc')).toStrictEqual(false);
  });

  test('Core.is.angle', () => {
    expect(Core.is.angle(0)).toStrictEqual(true);
    expect(Core.is.angle(100)).toStrictEqual(true);
    expect(Core.is.angle(-100)).toStrictEqual(true);
    expect(Core.is.angle(-370)).toStrictEqual(false);
  });

})