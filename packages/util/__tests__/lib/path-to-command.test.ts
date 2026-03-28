import {
  convertSVGPathToContext2DCommands,
  calcSVGPathBoundingBox,
  calcPathCommondsBoundingBox,
  parseSVGPath,
} from '@idraw/util';

describe('convertSVGPathToContext2DCommands', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.987654321);
  });
  test('convertSVGPathToContext2DCommands', () => {
    const svgPath = `M 10,30 L 50,30 H 80 V 60 C 100,60 120,80 120,100 S 140,140 160,140 Q 180,140 190,150 T 210,170 A 30,30 0 0,1 240,200 Z m 10,10 l 10,0 h 10 v 10 c 0,0 10,10 10,10 s 10,10 10,10 q 0,0 10,10 t 10,10 a 5,5 0 0,1 10,10`;

    const cmds = convertSVGPathToContext2DCommands(svgPath);
    expect(cmds).toStrictEqual([
      { id: 'zk00000ytuzk0000', name: 'beginPath', params: null },
      { id: 'zk00000ytuzk0000', name: 'moveTo', params: { x: 10, y: 30 } },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 23.333333333333336, cp1y: 30, cp2x: 36.66666666666667, cp2y: 30, x: 50, y: 30 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 60, cp1y: 30, cp2x: 70, cp2y: 30, x: 80, y: 30 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 80, cp1y: 40, cp2x: 80, cp2y: 50, x: 80, y: 60 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 100, cp1y: 60, cp2x: 120, cp2y: 80, x: 120, y: 100 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 120, cp1y: 120, cp2x: 140, cp2y: 140, x: 160, y: 140 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: {
          cp1x: 173.33333333333334,
          cp1y: 140,
          cp2x: 183.33333333333334,
          cp2y: 143.33333333333334,
          x: 190,
          y: 150,
        },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: {
          cp1x: 194.44444444444443,
          cp1y: 154.44444444444443,
          cp2x: 201.11111111111111,
          cp2y: 161.11111111111111,
          x: 210,
          y: 170,
        },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'ellipse',
        params: {
          centerX: 210,
          centerY: 200,
          radiusX: 30,
          radiusY: 30,
          rotation: 0,
          startRadian: -1.5707963267948966,
          endRadian: 0,
          anticlockwise: false,
        },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: {
          cp1x: 163.33333333333331,
          cp1y: 143.33333333333334,
          cp2x: 86.66666666666666,
          cp2y: 86.66666666666667,
          x: 10,
          y: 30,
        },
      },
      { id: 'zk00000ytuzk0000', name: 'closePath', params: null },
      { id: 'zk00000ytuzk0000', name: 'moveTo', params: { x: 20, y: 40 } },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 23.333333333333332, cp1y: 40, cp2x: 26.666666666666668, cp2y: 40, x: 30, y: 40 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 33.333333333333336, cp1y: 40, cp2x: 36.666666666666664, cp2y: 40, x: 40, y: 40 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 40, cp1y: 43.333333333333336, cp2x: 40, cp2y: 46.666666666666664, x: 40, y: 50 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 40, cp1y: 50, cp2x: 50, cp2y: 60, x: 50, y: 60 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 50, cp1y: 60, cp2x: 60, cp2y: 70, x: 60, y: 70 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: { cp1x: 60, cp1y: 70, cp2x: 63.333333333333336, cp2y: 73.33333333333333, x: 70, y: 80 },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'bezierCurveTo',
        params: {
          cp1x: 74.44444444444444,
          cp1y: 84.44444444444444,
          cp2x: 77.77777777777777,
          cp2y: 87.77777777777779,
          x: 80,
          y: 90,
        },
      },
      {
        id: 'zk00000ytuzk0000',
        name: 'ellipse',
        params: {
          centerX: 85,
          centerY: 95,
          radiusX: 7.0710678118654755,
          radiusY: 7.0710678118654755,
          rotation: 0,
          startRadian: -2.356194490192345,
          endRadian: 0.7853981633974483,
          anticlockwise: false,
        },
      },
    ]);
  });
});

describe('calcSVGPathBoundingBox', () => {
  test('calcSVGPathBoundingBox', () => {
    const svgPath = `M 10,30 L 50,30 H 80 V 60 C 100,60 120,80 120,100 S 140,140 160,140 Q 180,140 190,150 T 210,170 A 30,30 0 0,1 240,200 Z m 10,10 l 10,0 h 10 v 10 c 0,0 10,10 10,10 s 10,10 10,10 q 0,0 10,10 t 10,10 a 5,5 0 0,1 10,10`;
    const boundingBox = calcSVGPathBoundingBox(svgPath);
    expect(boundingBox).toStrictEqual({
      minX: 10,
      minY: 30,
      maxX: 240,
      maxY: 200,
      width: 230,
      height: 170,
      start: { x: 10, y: 30 },
      end: { x: 240, y: 200 },
    });
  });
});

describe('calcPathCommondsBoundingBox', () => {
  test('calcPathCommondsBoundingBox', () => {
    const svgPath = `M 10,30 L 50,30 H 80 V 60 C 100,60 120,80 120,100 S 140,140 160,140 Q 180,140 190,150 T 210,170 A 30,30 0 0,1 240,200 Z m 10,10 l 10,0 h 10 v 10 c 0,0 10,10 10,10 s 10,10 10,10 q 0,0 10,10 t 10,10 a 5,5 0 0,1 10,10`;
    const cmds = parseSVGPath(svgPath);
    const boundingBox = calcPathCommondsBoundingBox(cmds);
    expect(boundingBox).toStrictEqual({
      minX: 10,
      minY: 30,
      maxX: 240,
      maxY: 200,
      width: 230,
      height: 170,
      start: { x: 10, y: 30 },
      end: { x: 240, y: 200 },
    });
  });
});
