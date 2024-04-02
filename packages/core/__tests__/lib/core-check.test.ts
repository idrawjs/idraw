import Core from './../../src';

describe('@idraw/core static check', () => {
  test('Core.check.attrs', () => {
    expect(
      Core.check.attrs({
        x: 0,
        y: 100,
        w: 200,
        h: 200,
        angle: 0
      })
    ).toStrictEqual(true);

    expect(
      Core.check.attrs({
        x: 0,
        y: 100,
        w: -200,
        h: 200,
        angle: 0
      })
    ).toStrictEqual(false);

    expect(
      Core.check.attrs({
        x: 0,
        y: 100,
        w: 200,
        h: 200,
        angle: -99999
      })
    ).toStrictEqual(false);
  });

  test('Core.check.rectDesc', () => {
    expect(
      Core.check.rectDesc({
        bgColor: '#ffffff'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.rectDesc({
        bgColor: 123
      })
    ).toStrictEqual(false);

    expect(
      Core.check.rectDesc({
        borderRadius: 12,
        borderWidth: 10,
        borderColor: '#123abf',
        bgColor: '#ffffff'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.rectDesc({
        borderRadius: 12,
        borderWidth: 10,
        borderColor: '#123af'
      })
    ).toStrictEqual(false);
  });

  test('Core.check.circleDesc', () => {
    expect(
      Core.check.circleDesc({
        bgColor: '#ffffff'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.circleDesc({
        bgColor: 123
      })
    ).toStrictEqual(false);

    expect(
      Core.check.circleDesc({
        borderWidth: 10,
        borderColor: '#123abf',
        bgColor: '#ffffff'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.circleDesc({
        borderWidth: 10,
        borderColor: '#123af'
      })
    ).toStrictEqual(false);
  });

  test('Core.check.imageDesc', () => {
    expect(
      Core.check.imageDesc({
        src: 'https://xxxxxx'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.imageDesc({
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOg'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.imageDesc({
        src: '/xx/xxx/xxx'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.imageDesc({
        src: './xx/xxx/xxx'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.imageDesc({
        src: 'abcdefg'
      })
    ).toStrictEqual(false);

    expect(
      Core.check.imageDesc({
        src: 1234
      })
    ).toStrictEqual(false);

    expect(Core.check.imageDesc({})).toStrictEqual(false);
  });

  test('Core.check.svgDesc', () => {
    expect(
      Core.check.svgDesc({
        svg: `
      <svg t="12231231">
        <g></g>
      </svg>
      `
      })
    ).toStrictEqual(true);

    expect(
      Core.check.svgDesc({
        svg: `
      <svg>
        <g></g>
      </  svg>
      `
      })
    ).toStrictEqual(true);

    expect(
      Core.check.svgDesc({
        svg: './xxxxx/xxx'
      })
    ).toStrictEqual(false);

    expect(Core.check.svgDesc({})).toStrictEqual(false);
  });

  test('Core.check.htmlDesc', () => {
    expect(
      Core.check.htmlDesc({
        html: `
      <style>
        .box { display: block }
      </style>
      <div class="box">Hello World</div>
      `
      })
    ).toStrictEqual(true);

    expect(
      Core.check.htmlDesc({
        html: `
      abcdefg
      <div class="box">Hello World</div>
      `
      })
    ).toStrictEqual(true);

    expect(
      Core.check.htmlDesc({
        html: 'Hello World'
      })
    ).toStrictEqual(false);

    expect(Core.check.htmlDesc({})).toStrictEqual(false);
  });

  test('Core.check.textDesc', () => {
    expect(
      Core.check.textDesc({
        text: 'abcdefg',
        color: '#af1234',
        bgColor: '#f0f0f0',
        fontSize: 12,
        lineHeight: 12,
        lineSpacing: 0,
        fontWeight: 'bold',
        fontFamily: 'abc',
        textAlign: 'center',
        borderRadius: 12,
        borderWidth: 10,
        borderColor: '#123abf'
      })
    ).toStrictEqual(true);

    expect(
      Core.check.textDesc({
        text: 'abcdefg',
        color: '#af1234',
        fontSize: 12
      })
    ).toStrictEqual(true);

    expect(Core.check.textDesc({})).toStrictEqual(false);
  });
});
