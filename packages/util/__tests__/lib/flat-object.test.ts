import { flatObject } from '@idraw/util';

describe('flatObject', () => {
  test('Basic object flattening', () => {
    expect(flatObject({ a: { b: { c: 1 } } })).toEqual({ 'a.b.c': 1 });
  });

  test('Array flattening', () => {
    expect(flatObject({ a: { b: ['c', 'd'] } })).toEqual({
      'a.b[0]': 'c',
      'a.b[1]': 'd'
    });
  });

  test('Mixed types handling', () => {
    const date = new Date();
    expect(
      flatObject({
        a: {
          b: 1,
          c: [{ d: date }, null]
        }
      })
    ).toStrictEqual({
      'a.b': 1,
      'a.c[0].d': date,
      'a.c[1]': null
    });
  });

  test('Primitive values handling', () => {
    expect(flatObject(42 as any)).toEqual({ '': 42 });
    expect(flatObject('text' as any)).toEqual({ '': 'text' });
    expect(flatObject(null as any)).toEqual({ '': null });
  });

  test('Circular reference', () => {
    const obj: Record<string, any> = { a: 1 };
    obj.self = obj;
    expect(() => flatObject(obj)).toThrow();
  });
});
