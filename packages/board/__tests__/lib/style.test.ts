import {
  mergeCSS2StyleAttr, setStyle, getStyle, getDomTransform,
  setDomTransform,
} from './../../src/lib/style';


describe('@idraw/board: src/lib/style', () => {
  test('mergeCSS2StyleAttr', () => {
    const str = mergeCSS2StyleAttr({
      'width': '12px',
      'height': '20px',
      'overflow': 'auto',
      'margin-top': '123px',
    });
    expect(str).toStrictEqual('width:12px; height:20px; overflow:auto; margin-top:123px;');
  });

  test('setStyle', () => {
    const div = document.createElement('div');
    setStyle(div, {
      'width': '12px',
      'height': '20px',
      'overflow': 'auto',
      'margin-top': '123px',
    });
    expect(div).toMatchSnapshot();
  });

  test('getStyle', () => {
    const div = document.createElement('div');
    setStyle(div, {
      'width': '12px',
      'height': '20px',
      'overflow': 'auto',
      'margin-top': '123px',
    });
    expect(getStyle(div)).toMatchSnapshot({
      'width': '12px',
      'height': '20px',
      'overflow': 'auto',
      'margin-top': '123px',
    });
  });

  test('setDomTransform', () => {
    // transform: matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
    // matrix(1, 2, -1, 1, 80, 80)
    const div = document.createElement('div');
    setDomTransform(div, {
      scaleX: 1,
      skewY: 2,
      skewX: -1,
      scaleY: 1,
      translateX: 80,
      translateY: 90,
    });
    expect(div).toMatchSnapshot();
  })

  test('getDomTransform', () => {
    // transform: matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )
    // matrix(1, 2, -1, 1, 80, 80)
    const div = document.createElement('div');
    setDomTransform(div, {
      scaleX: 1,
      skewY: 2,
      skewX: -1,
      scaleY: 1,
      translateX: 80,
      translateY: 90,
    });
    expect(getDomTransform(div)).toStrictEqual({
      scaleX: 1,
      skewY: 2,
      skewX: -1,
      scaleY: 1,
      translateX: 80,
      translateY: 90,
    });
  })
})