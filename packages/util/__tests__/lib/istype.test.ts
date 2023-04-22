/* eslint-disable @typescript-eslint/no-empty-function */
import { istype } from '../../src/lib/istype';

describe('@idraw/util: lib/istype', () => {
  const _num = 123;
  const _str = 'abc';
  const _null = null;
  const _undefined = undefined;
  const _arr = [0, 1, 2, 3];
  const _json = {
    a: [0, 1, 2, 3],
    b: {
      c: 123
    }
  };
  const _func = function () {};
  const _asyncfunc = async function () {};
  const _promise = new Promise(() => {});

  test('istype.type', async () => {
    expect(istype.type(_num)).toStrictEqual('Number');
    expect(istype.type(_str)).toStrictEqual('String');
    expect(istype.type(_undefined)).toStrictEqual('Undefined');
    expect(istype.type(_arr)).toStrictEqual('Array');
    expect(istype.type(_null)).toStrictEqual('Null');
    expect(istype.type(_json)).toStrictEqual('Object');
    expect(istype.type(_func)).toStrictEqual('Function');
    expect(istype.type(_asyncfunc)).toStrictEqual('AsyncFunction');
    expect(istype.type(_promise)).toStrictEqual('Promise');
  });

  test('istype.array', async () => {
    expect(istype.array(_arr)).toStrictEqual(true);
    expect(istype.array(null)).toStrictEqual(false);
  });

  test('istype.json', async () => {
    expect(istype.json(_json)).toStrictEqual(true);
    expect(istype.json(null)).toStrictEqual(false);
  });

  test('istype.function', async () => {
    expect(istype.function(_func)).toStrictEqual(true);
    expect(istype.function(null)).toStrictEqual(false);
  });

  test('istype.asyncFunction', async () => {
    expect(istype.asyncFunction(_asyncfunc)).toStrictEqual(true);
    expect(istype.asyncFunction(null)).toStrictEqual(false);
  });

  test('istype.string', async () => {
    expect(istype.string(_str)).toStrictEqual(true);
    expect(istype.string(null)).toStrictEqual(false);
  });

  test('istype.number', async () => {
    expect(istype.number(_num)).toStrictEqual(true);
    expect(istype.number(null)).toStrictEqual(false);
  });

  test('istype.undefined', async () => {
    expect(istype.undefined(_undefined)).toStrictEqual(true);
    expect(istype.undefined(null)).toStrictEqual(false);
  });

  test('istype.null', async () => {
    expect(istype.null(_null)).toStrictEqual(true);
    expect(istype.null(1)).toStrictEqual(false);
  });

  test('istype.promise', async () => {
    expect(istype.promise(_promise)).toStrictEqual(true);
    expect(istype.promise(null)).toStrictEqual(false);
  });
});
