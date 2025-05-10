// get-set.test.ts
import { get, set, toPath } from '@idraw/util';

describe('toPath()', () => {
  test('should handle string path with dots and brackets', () => {
    expect(toPath('a[0].b.c')).toEqual(['a', '0', 'b', 'c']);
    expect(toPath('x.y.z')).toEqual(['x', 'y', 'z']);
    expect(toPath('arr[3].prop')).toEqual(['arr', '3', 'prop']);
  });

  test('should handle array path', () => {
    expect(toPath(['a', '0', 'b'])).toEqual(['a', '0', 'b']);
  });

  test('should handle empty path', () => {
    expect(toPath('')).toEqual([]);
    expect(toPath([])).toEqual([]);
  });
});

describe('get()', () => {
  const testObj = {
    a: {
      b: {
        c: 42,
        d: [null, { e: 'value' }]
      }
    },
    x: null,
    y: undefined
  };

  test('should retrieve nested values', () => {
    expect(get(testObj, 'a.b.c')).toBe(42);
    expect(get(testObj, ['a', 'b', 'd', '1', 'e'])).toBe('value');
    expect(get(testObj, 'a.b.d[0]')).toBe(null);
  });

  test('should handle invalid paths', () => {
    expect(get(testObj, 'a.b.z')).toBeUndefined();
    expect(get(testObj, 'x.y.z')).toBeUndefined();
    expect(get(testObj, 'y.z')).toBeUndefined();
  });

  test('should return defaultValue for missing paths', () => {
    expect(get(testObj, 'a.missing', 'default')).toBe('default');
    expect(get({}, 'any.path', 123)).toBe(123);
  });

  test('should handle edge cases', () => {
    expect(get(null, 'any.path', 'default')).toBe('default');
    expect(get(undefined, 'any.path', 'default')).toBe('default');
    expect(get({ a: 1 }, '')).toBeUndefined();
  });
});

describe('set()', () => {
  test('should set nested values in existing structure', () => {
    const obj = { a: { b: { c: 1 } } };
    set(obj, 'a.b.c', 2);
    expect(obj.a.b.c).toBe(2);
  });

  test('should create missing path structures', () => {
    const obj = {};
    set(obj, 'x[0].y.z', 'value');
    expect(obj).toEqual({
      x: [
        {
          y: {
            z: 'value'
          }
        }
      ]
    });
  });

  test('should handle array indexes', () => {
    const obj = { arr: [] };
    set(obj, 'arr[2].name', 'third');
    expect(obj.arr).toEqual([, , { name: 'third' }]); // eslint-disable-line no-sparse-arrays
  });

  test('should overwrite existing primitives', () => {
    const obj = { a: 1 };
    set(obj, 'a.b.c', 'new-value');
    expect(obj).toEqual({ a: { b: { c: 'new-value' } } });
  });

  test('should handle empty path', () => {
    const obj = { a: 1 };
    set(obj, '', 42);
    expect(obj).toEqual({ a: 1 });
  });

  test('should handle null/undefined objects', () => {
    const obj = null;
    set(obj, 'a.b.c', 'value');
    expect(obj).toBeNull();
  });

  test('should create arrays when next key is numeric', () => {
    const obj: any = {};
    set(obj, 'arr[1].prop', 'test');
    expect(Array.isArray(obj.arr)).toBe(true);
    expect(obj.arr[1].prop).toBe('test');
  });

  test('should handle intermediate null values', () => {
    const obj: any = { a: null };
    set(obj, 'a.b.c', 'value');
    expect(obj.a.b.c).toBe('value');
  });
});
