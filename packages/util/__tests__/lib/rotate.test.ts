import { rotatePoint, parseAngleToRadian, parseRadianToAngle, calcRadian } from '@idraw/util';

describe('@idraw/util: rotate', () => {
  test('rotatePoint', () => {
    const center = { x: 100, y: 100 };
    const start = { x: 200, y: 100 };
    const end = rotatePoint(center, start, Math.PI / 2);
    expect(end).toStrictEqual({ x: 100, y: 200 });
  });

  test('rotatePoint [0,90]deg, 0-30-60-90', () => {
    const r = 100;
    const center = { x: 0, y: 0 };
    const start0 = { x: r, y: 0 };
    const deg30 = 30;
    const radian = parseAngleToRadian(deg30);
    // 0-30
    const start1 = rotatePoint(center, start0, radian);
    expect(start1.x).toBeCloseTo(r * Math.cos(radian));
    expect(start1.y).toBeCloseTo(r * Math.sin(radian));

    // 30-60
    const start2 = rotatePoint(center, start1, radian);
    expect(start2.x).toBeCloseTo(r * Math.sin(radian));
    expect(start2.y).toBeCloseTo(r * Math.cos(radian));

    // 60-90
    const start3 = rotatePoint(center, start2, radian);
    expect(start3.x).toBeCloseTo(0);
    expect(start3.y).toBeCloseTo(r);
  });

  test('rotatePoint [0,90]deg, 30-45-60-45-30', () => {
    const center = { x: 0, y: 0 };
    const deg15 = 15;
    const radian15 = parseAngleToRadian(deg15);
    const radian30 = radian15 * 2;

    const r = 100;
    // 30-45
    const start0 = { x: r * Math.cos(radian30), y: r * Math.sin(radian30) };
    const start1 = rotatePoint(center, start0, radian15);
    expect(start1.x).toBeCloseTo(r * Math.cos(radian15 * 3));
    expect(start1.y).toBeCloseTo(r * Math.sin(radian15 * 3));

    // 45-60
    const start2 = rotatePoint(center, start1, radian15);
    expect(start2.x).toBeCloseTo(r * Math.sin(radian30));
    expect(start2.y).toBeCloseTo(r * Math.cos(radian30));

    // 60-45
    const start3 = rotatePoint(center, start2, 0 - radian15);
    expect(start3.x).toBeCloseTo(start1.x);
    expect(start3.y).toBeCloseTo(start1.y);

    // 45-30
    const start4 = rotatePoint(center, start3, 0 - radian15);
    expect(start4.x).toBeCloseTo(start0.x);
    expect(start4.y).toBeCloseTo(start0.y);
  });

  test('rotatePoint [90,180]deg, 90-120-150-180', () => {
    const r = 100;
    const center = { x: 0, y: 0 };
    const start0 = { x: 0, y: r };
    const deg30 = 30;
    const radian = parseAngleToRadian(deg30);
    // 90-120
    const start1 = rotatePoint(center, start0, radian);
    expect(start1.x).toBeCloseTo(-r * Math.sin(radian));
    expect(start1.y).toBeCloseTo(r * Math.cos(radian));

    // 120-150
    const start2 = rotatePoint(center, start1, radian);
    expect(start2.x).toBeCloseTo(-r * Math.cos(radian));
    expect(start2.y).toBeCloseTo(r * Math.sin(radian));

    // 150-180
    const start3 = rotatePoint(center, start2, radian);
    expect(start3.x).toBeCloseTo(-r);
    expect(start3.y).toBeCloseTo(0);
  });

  test('rotatePoint [90,180]deg, 120-135-150-135-120', () => {
    const center = { x: 0, y: 0 };
    const deg15 = 15;
    const radian15 = parseAngleToRadian(deg15);
    const radian30 = radian15 * 2;

    const r = 100;
    // 120-135
    const start0 = { x: -r * Math.sin(radian30), y: r * Math.cos(radian30) };
    const start1 = rotatePoint(center, start0, radian15);
    expect(start1.x).toBeCloseTo(-r * Math.cos(radian15 * 3));
    expect(start1.y).toBeCloseTo(r * Math.sin(radian15 * 3));

    // 135-150
    const start2 = rotatePoint(center, start1, radian15);
    expect(start2.x).toBeCloseTo(-r * Math.cos(radian30));
    expect(start2.y).toBeCloseTo(r * Math.sin(radian30));

    // 150-135
    const start3 = rotatePoint(center, start2, 0 - radian15);
    expect(start3.x).toBeCloseTo(start1.x);
    expect(start3.y).toBeCloseTo(start1.y);

    // 135-120
    const start4 = rotatePoint(center, start3, 0 - radian15);
    expect(start4.x).toBeCloseTo(start0.x);
    expect(start4.y).toBeCloseTo(start0.y);
  });

  test('rotatePoint [180,270]deg, 180-210-240-270', () => {
    const r = 100;
    const center = { x: 0, y: 0 };
    const start0 = { x: -r, y: 0 };
    const deg30 = 30;
    const radian = parseAngleToRadian(deg30);
    // 180-210
    const start1 = rotatePoint(center, start0, radian);
    expect(start1.x).toBeCloseTo(-r * Math.cos(radian));
    expect(start1.y).toBeCloseTo(-r * Math.sin(radian));

    // 210-240
    const start2 = rotatePoint(center, start1, radian);
    expect(start2.x).toBeCloseTo(-r * Math.sin(radian));
    expect(start2.y).toBeCloseTo(-r * Math.cos(radian));

    // 240-270
    const start3 = rotatePoint(center, start2, radian);
    expect(start3.x).toBeCloseTo(0);
    expect(start3.y).toBeCloseTo(-r);
  });

  test('rotatePoint [180,270]deg, 210-225-240-225-210', () => {
    const center = { x: 0, y: 0 };
    const deg15 = 15;
    const radian15 = parseAngleToRadian(deg15);
    const radian30 = radian15 * 2;

    const r = 100;
    // 210-225
    const start0 = { x: -r * Math.cos(radian30), y: -r * Math.sin(radian30) };
    const start1 = rotatePoint(center, start0, radian15);
    expect(start1.x).toBeCloseTo(-r * Math.sin(radian15 * 3));
    expect(start1.y).toBeCloseTo(-r * Math.cos(radian15 * 3));

    // 225-240
    const start2 = rotatePoint(center, start1, radian15);
    expect(start2.x).toBeCloseTo(-r * Math.sin(radian30));
    expect(start2.y).toBeCloseTo(-r * Math.cos(radian30));

    // 240-225
    const start3 = rotatePoint(center, start2, 0 - radian15);
    expect(start3.x).toBeCloseTo(start1.x);
    expect(start3.y).toBeCloseTo(start1.y);

    // 225-210
    const start4 = rotatePoint(center, start3, 0 - radian15);
    expect(start4.x).toBeCloseTo(start0.x);
    expect(start4.y).toBeCloseTo(start0.y);
  });

  test('rotatePoint [270,360]deg, 180-210-240-270', () => {
    const r = 100;
    const center = { x: 0, y: 0 };
    const start0 = { x: 0, y: -r };
    const deg30 = 30;
    const radian = parseAngleToRadian(deg30);
    // 270-300
    const start1 = rotatePoint(center, start0, radian);
    expect(start1.x).toBeCloseTo(r * Math.sin(radian));
    expect(start1.y).toBeCloseTo(-r * Math.cos(radian));

    // 300-330
    const start2 = rotatePoint(center, start1, radian);
    expect(start2.x).toBeCloseTo(r * Math.cos(radian));
    expect(start2.y).toBeCloseTo(-r * Math.sin(radian));

    // 330-360
    const start3 = rotatePoint(center, start2, radian);
    expect(start3.x).toBeCloseTo(r);
    expect(start3.y).toBeCloseTo(0);
  });

  test('rotatePoint [270,360]deg, 300-315-330-315-300', () => {
    const center = { x: 0, y: 0 };
    const deg15 = 15;
    const radian15 = parseAngleToRadian(deg15);
    const radian30 = radian15 * 2;

    const r = 100;
    // 300-315
    const start0 = { x: r * Math.sin(radian30), y: -r * Math.cos(radian30) };
    const start1 = rotatePoint(center, start0, radian15);
    expect(start1.x).toBeCloseTo(r * Math.cos(radian15 * 3));
    expect(start1.y).toBeCloseTo(-r * Math.sin(radian15 * 3));

    // 315-330
    const start2 = rotatePoint(center, start1, radian15);
    expect(start2.x).toBeCloseTo(r * Math.cos(radian30));
    expect(start2.y).toBeCloseTo(-r * Math.sin(radian30));

    // 330-315
    const start3 = rotatePoint(center, start2, 0 - radian15);
    expect(start3.x).toBeCloseTo(start1.x);
    expect(start3.y).toBeCloseTo(start1.y);

    // 315-300
    const start4 = rotatePoint(center, start3, 0 - radian15);
    expect(start4.x).toBeCloseTo(start0.x);
    expect(start4.y).toBeCloseTo(start0.y);
  });

  test('calcRadian 1', () => {
    const start = { x: 402, y: 328 };
    const end = { x: 341, y: 414 };
    const center = { x: 400, y: 400 };
    expect(parseRadianToAngle(calcRadian(center, start, end))).toBeCloseTo(255.060132615518);
  });
  test('calcRadian 2', () => {
    const start = { x: 402, y: 328 };
    const end = { x: 340, y: 392 };
    const center = { x: 400, y: 400 };
    expect(parseRadianToAngle(calcRadian(center, start, end))).toBeCloseTo(276.00350309739684);
  });
});
