import Core from './../../src';

describe('@idraw/core:static is', () => {
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

  test('Core.is.borderWidth', () => {
    expect(Core.is.borderWidth(0)).toStrictEqual(true);
    expect(Core.is.borderWidth(100)).toStrictEqual(true);
    expect(Core.is.borderWidth(-100)).toStrictEqual(false);
    expect(Core.is.borderWidth(-370)).toStrictEqual(false);
  });

  test('Core.is.borderRadius', () => {
    expect(Core.is.borderRadius(0)).toStrictEqual(true);
    expect(Core.is.borderRadius(100)).toStrictEqual(true);
    expect(Core.is.borderRadius(-100)).toStrictEqual(false);
    expect(Core.is.borderRadius(-370)).toStrictEqual(false);
  });

  test('Core.is.color', () => {
    expect(Core.is.color('#a23')).toStrictEqual(true);
    expect(Core.is.color('#a2312f')).toStrictEqual(true);
    expect(Core.is.color('#a2312')).toStrictEqual(false);
    expect(Core.is.color('#a2')).toStrictEqual(false);
  });

  test('Core.is.imageSrc', () => {
    expect(Core.is.imageSrc('https://xxxxx')).toStrictEqual(true);
    expect(Core.is.imageSrc('http://xxxxx')).toStrictEqual(true);
    expect(Core.is.imageSrc('./xxxxx/xxx')).toStrictEqual(true);
    expect(Core.is.imageSrc('/xxxxx/xxx')).toStrictEqual(true);
    expect(
      Core.is.imageSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOg')
    ).toStrictEqual(true);
    expect(Core.is.imageSrc('dafafsfsaffafa')).toStrictEqual(false);
  });

  test('Core.is.imageURL', () => {
    expect(Core.is.imageURL('https://xxxxx')).toStrictEqual(true);
    expect(Core.is.imageURL('http://xxxxx')).toStrictEqual(true);
    expect(Core.is.imageURL('./xxxxx/xxx')).toStrictEqual(true);
    expect(Core.is.imageURL('/xxxxx/xxx')).toStrictEqual(true);
    expect(Core.is.imageURL('dafafsfsaffafa')).toStrictEqual(false);
  });

  test('Core.is.imageBase64', () => {
    expect(
      Core.is.imageBase64('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOg')
    ).toStrictEqual(true);
    expect(Core.is.imageBase64('http://xxxxx')).toStrictEqual(false);
    expect(Core.is.imageBase64('./xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.imageBase64('/xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.imageBase64('dafafsfsaffafa')).toStrictEqual(false);
  });

  test('Core.is.svg', () => {
    expect(
      Core.is.svg(`
      <svg t="12231231">
        <g></g>
      </svg>
      `)
    ).toStrictEqual(true);
    expect(
      Core.is.svg(`
      <svg>
        <g></g>
      </  svg>
      `)
    ).toStrictEqual(true);
    expect(Core.is.svg('./xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.svg('/xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.svg('dafafsfsaffafa')).toStrictEqual(false);
  });

  test('Core.is.html', () => {
    expect(
      Core.is.html(`
     <div>Hello World</div>
      `)
    ).toStrictEqual(true);
    expect(
      Core.is.html(`
      <style>
        .box { display: block }
      </style>
      <div class="box">Hello World</div>
      `)
    ).toStrictEqual(true);
    expect(Core.is.html('./xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.html('/xxxxx/xxx')).toStrictEqual(false);
    expect(Core.is.html('dafafsfsaffafa')).toStrictEqual(false);
  });

  test('Core.is.text', () => {
    expect(Core.is.text('abcdefg123456')).toStrictEqual(true);
    expect(Core.is.text('')).toStrictEqual(true);
    expect(Core.is.text(123)).toStrictEqual(false);
  });

  test('Core.is.fontSize', () => {
    expect(Core.is.fontSize(12)).toStrictEqual(true);
    expect(Core.is.fontSize(0)).toStrictEqual(false);
    expect(Core.is.fontSize(-10)).toStrictEqual(false);
  });

  test('Core.is.lineHeight', () => {
    expect(Core.is.lineHeight(12)).toStrictEqual(true);
    expect(Core.is.lineHeight(0)).toStrictEqual(false);
    expect(Core.is.lineHeight(-10)).toStrictEqual(false);
  });

  test('Core.is.lineSpacing', () => {
    expect(Core.is.lineSpacing(12)).toStrictEqual(true);
    expect(Core.is.lineSpacing(0)).toStrictEqual(false);
    expect(Core.is.lineSpacing(-10)).toStrictEqual(false);
  });

  test('Core.is.textAlign', () => {
    expect(Core.is.textAlign('center')).toStrictEqual(true);
    expect(Core.is.textAlign('left')).toStrictEqual(true);
    expect(Core.is.textAlign('right')).toStrictEqual(true);
    expect(Core.is.textAlign('helloworld')).toStrictEqual(false);
  });

  test('Core.is.fontFamily', () => {
    expect(Core.is.fontFamily('yahei')).toStrictEqual(true);
    expect(Core.is.fontFamily('helloworld')).toStrictEqual(true);
    expect(Core.is.fontFamily('')).toStrictEqual(false);
  });

  test('Core.is.fontWeight', () => {
    expect(Core.is.fontWeight('bold')).toStrictEqual(true);
    expect(Core.is.fontWeight('xxxxxxx')).toStrictEqual(false);
    expect(Core.is.fontWeight('')).toStrictEqual(false);
  });
});
