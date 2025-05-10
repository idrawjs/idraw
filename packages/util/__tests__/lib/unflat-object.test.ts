import { unflatObject } from '@idraw/util';

describe('unflatObject', () => {
  test('unflat object', () => {
    expect(unflatObject({ 'a.b.c': 1 })).toStrictEqual({
      a: { b: { c: 1 } }
    });
  });

  test('unflat array', () => {
    const input = {
      'list[0]': 'a',
      'list[1].name': 'b'
    };
    expect(unflatObject(input)).toEqual({ list: ['a', { name: 'b' }] });
  });

  test('unflat array and object', () => {
    const input = {
      'user.name': 'Alice',
      'posts[0].title': 'First',
      'posts[1].tags[0]': 'tech'
    };
    expect(unflatObject(input)).toEqual({
      user: { name: 'Alice' },
      posts: [{ title: 'First' }, { tags: ['tech'] }]
    });
  });

  test('Error', () => {
    expect(() =>
      unflatObject({
        'a.b': 1,
        'a[0]': 2
      })
    ).toThrow(`Structure conflict at path 'a.0': Expected array but found object`);

    // expect(() =>
    //   unflatObject({
    //     'a..b': 1
    //   })
    // ).toStrictEqual({});
  });

  test('Side cases', () => {
    // expect(unflatObject({})).toEqual({});
    // expect(unflatObject({ '': 42 })).toEqual({ '': 42 });
    expect(unflatObject({ '': 42 })).toEqual({});
  });
});
