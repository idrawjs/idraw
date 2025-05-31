import { createElement, resizeEffectGroupElement } from '@idraw/util';
import type { Element } from '@idraw/types';

const createGroupByRatio = (opts?: { xRatio?: number; yRatio?: number }) => {
  const { xRatio = 1, yRatio = 1 } = opts || {};
  const minRatio = Math.min(xRatio, yRatio);
  const maxRatio = Math.max(xRatio, yRatio);
  const midRatio = (minRatio + maxRatio) / 2;

  const group: Element<'group'> = createElement('group', {
    uuid: 'test-001',
    x: 10,
    y: 10,
    w: 2000 * xRatio,
    h: 2000 * yRatio,
    detail: {
      children: [
        createElement('rect', { uuid: 'test-002', x: 20 * xRatio, y: 20 * yRatio, w: 20 * xRatio, h: 20 * yRatio }),
        createElement('circle', { uuid: 'test-003', x: 40 * xRatio, y: 40 * yRatio, w: 40 * xRatio, h: 40 * yRatio }),
        createElement('text', {
          uuid: 'test-004',
          x: 60 * xRatio,
          y: 60 * yRatio,
          w: 60 * xRatio,
          h: 60 * yRatio,
          detail: {
            fontSize: 16 * midRatio,
            // lineHeight: 32 * midRatio,
            text: 'Text in Group'
          }
        }),
        createElement('image', {
          uuid: 'test-005',
          x: 80 * xRatio,
          y: 80 * yRatio,
          w: 80 * xRatio,
          h: 80 * yRatio,
          detail: { src: 'https://example.com/002.png' }
        }),
        createElement('group', {
          uuid: 'test-100',
          x: 500 * xRatio,
          y: 500 * yRatio,
          w: 1000 * xRatio,
          h: 1000 * yRatio,
          detail: {
            children: [
              createElement('rect', {
                uuid: 'test-101',
                x: 20 * xRatio,
                y: 20 * yRatio,
                w: 20 * xRatio,
                h: 20 * yRatio
              }),
              createElement('circle', {
                uuid: 'test-102',
                x: 40 * xRatio,
                y: 40 * yRatio,
                w: 40 * xRatio,
                h: 40 * yRatio
              }),
              createElement('text', {
                uuid: 'test-103',
                x: 60 * xRatio,
                y: 60 * yRatio,
                w: 60 * xRatio,
                h: 60 * yRatio,
                detail: {
                  fontSize: 16 * midRatio,
                  text: 'Text in Group'
                }
              }),
              createElement('image', {
                uuid: 'test-104',
                x: 80 * xRatio,
                y: 80 * yRatio,
                w: 80 * xRatio,
                h: 80 * yRatio,
                detail: { src: 'https://example.com/002.png' }
              })
            ]
          }
        })
      ]
    },
    operations: {
      resizeEffect: 'deepResize'
    }
  });
  return group;
};

const createGroupByFixed = (opts: { moveX: number; moveY: number; moveW: number; moveH: number }) => {
  const { moveX, moveY, moveW, moveH } = opts || {};

  const group: Element<'group'> = createElement('group', {
    uuid: 'test-001',
    x: 10 + moveX,
    y: 10 + moveY,
    w: 2000 + moveW,
    h: 2000 + moveH,
    detail: {
      children: [
        createElement('rect', { uuid: 'test-002', x: 20 - moveX, y: 20 - moveY, w: 20, h: 20 }),
        createElement('circle', { uuid: 'test-003', x: 40 - moveX, y: 40 - moveY, w: 40, h: 40 }),
        createElement('text', {
          uuid: 'test-004',
          x: 60 - moveX,
          y: 60 - moveY,
          w: 60,
          h: 60,
          detail: {
            fontSize: 16,
            text: 'Text in Group'
          }
        }),
        createElement('image', {
          uuid: 'test-005',
          x: 80 - moveX,
          y: 80 - moveY,
          w: 80,
          h: 80,
          detail: { src: 'https://example.com/002.png' }
        }),
        createElement('group', {
          uuid: 'test-100',
          x: 500 - moveX,
          y: 500 - moveY,
          w: 1000,
          h: 1000,
          detail: {
            children: [
              createElement('rect', {
                uuid: 'test-101',
                x: 20,
                y: 20,
                w: 20,
                h: 20
              }),
              createElement('circle', {
                uuid: 'test-102',
                x: 40,
                y: 40,
                w: 40,
                h: 40
              }),
              createElement('text', {
                uuid: 'test-103',
                x: 60,
                y: 60,
                w: 60,
                h: 60,
                detail: {
                  fontSize: 16,
                  text: 'Text in Group'
                }
              }),
              createElement('image', {
                uuid: 'test-104',
                x: 80,
                y: 80,
                w: 80,
                h: 80,
                detail: { src: 'https://example.com/002.png' }
              })
            ]
          }
        })
      ]
    },
    operations: {
      resizeEffect: 'deepResize'
    }
  });
  return group;
};

describe('resizeEffectGroupElement', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('deepSize', () => {
    const group = createGroupByRatio();
    const xRatio = 2;
    const yRatio = 3;

    const record = resizeEffectGroupElement(
      group,
      {
        w: group.w * xRatio,
        h: group.h * yRatio
      },
      {
        resizeEffect: 'deepResize'
      }
    );

    expect(group).toStrictEqual(
      createGroupByRatio({
        xRatio,
        yRatio
      })
    );

    expect(record).toStrictEqual({
      type: 'resizeElements',
      time: 1735689600000,
      content: {
        method: 'modifyElements',
        before: [
          { uuid: 'test-001', x: 10, y: 10, w: 2000, h: 2000 },
          { x: 20, y: 20, w: 20, h: 20, uuid: 'test-002' },
          { x: 40, y: 40, w: 40, h: 40, uuid: 'test-003' },
          { x: 60, y: 60, w: 60, h: 60, uuid: 'test-004', 'detail.fontSize': 16 },
          { x: 80, y: 80, w: 80, h: 80, uuid: 'test-005' },
          { x: 500, y: 500, w: 1000, h: 1000, uuid: 'test-100' },
          { x: 20, y: 20, w: 20, h: 20, uuid: 'test-101' },
          { x: 40, y: 40, w: 40, h: 40, uuid: 'test-102' },
          { x: 60, y: 60, w: 60, h: 60, uuid: 'test-103', 'detail.fontSize': 16 },
          { x: 80, y: 80, w: 80, h: 80, uuid: 'test-104' }
        ],
        after: [
          { uuid: 'test-001', x: 10, y: 10, w: 4000, h: 6000 },
          { x: 40, y: 60, w: 40, h: 60, uuid: 'test-002' },
          { x: 80, y: 120, w: 80, h: 120, uuid: 'test-003' },
          { x: 120, y: 180, w: 120, h: 180, uuid: 'test-004', 'detail.fontSize': 40 },
          { x: 160, y: 240, w: 160, h: 240, uuid: 'test-005' },
          { x: 1000, y: 1500, w: 2000, h: 3000, uuid: 'test-100' },
          { x: 40, y: 60, w: 40, h: 60, uuid: 'test-101' },
          { x: 80, y: 120, w: 80, h: 120, uuid: 'test-102' },
          { x: 120, y: 180, w: 120, h: 180, uuid: 'test-103', 'detail.fontSize': 40 },
          { x: 160, y: 240, w: 160, h: 240, uuid: 'test-104' }
        ]
      }
    });
  });

  test('fixed', () => {
    const group = createGroupByRatio();
    const moveX = 99;
    const moveY = 88;
    const moveW = 77;
    const moveH = 66;

    const record = resizeEffectGroupElement(
      group,
      {
        x: group.x + moveX,
        y: group.y + moveY,
        w: group.w + moveW,
        h: group.h + moveH
      },
      {
        resizeEffect: 'fixed'
      }
    );

    expect(group).toStrictEqual(
      createGroupByFixed({
        moveX,
        moveY,
        moveW,
        moveH
      })
    );

    expect(record).toStrictEqual({
      type: 'resizeElements',
      time: 1735689600000,
      content: {
        method: 'modifyElements',
        before: [
          { uuid: 'test-001', x: 10, y: 10, w: 2000, h: 2000 },
          { uuid: 'test-002', x: 20, y: 20 },
          { uuid: 'test-003', x: 40, y: 40 },
          { uuid: 'test-004', x: 60, y: 60 },
          { uuid: 'test-005', x: 80, y: 80 },
          { uuid: 'test-100', x: 500, y: 500 }
        ],
        after: [
          { uuid: 'test-001', x: 109, y: 98, w: 2077, h: 2066 },
          { uuid: 'test-002', x: -79, y: -68 },
          { uuid: 'test-003', x: -59, y: -48 },
          { uuid: 'test-004', x: -39, y: -28 },
          { uuid: 'test-005', x: -19, y: -8 },
          { uuid: 'test-100', x: 401, y: 412 }
        ]
      }
    });
  });
});
