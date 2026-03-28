import { createMaterial, resizeEffectGroupMaterial } from '@idraw/util';
import type { StrictMaterial } from '@idraw/types';

const createGroupByRatio = (opts?: { xRatio?: number; yRatio?: number }) => {
  const { xRatio = 1, yRatio = 1 } = opts || {};
  const minRatio = Math.min(xRatio, yRatio);
  const maxRatio = Math.max(xRatio, yRatio);
  const midRatio = (minRatio + maxRatio) / 2;

  const group: StrictMaterial<'group'> = createMaterial('group', {
    id: 'test-001',
    x: 10,
    y: 10,
    width: 2000 * xRatio,
    height: 2000 * yRatio,
    children: [
      createMaterial('rect', {
        id: 'test-002',
        x: 20 * xRatio,
        y: 20 * yRatio,
        width: 20 * xRatio,
        height: 20 * yRatio,
      }),
      createMaterial('circle', {
        id: 'test-003',
        x: 40 * xRatio,
        y: 40 * yRatio,
        width: 40 * xRatio,
        height: 40 * yRatio,
      }),
      createMaterial('text', {
        id: 'test-004',
        x: 60 * xRatio,
        y: 60 * yRatio,
        width: 60 * xRatio,
        height: 60 * yRatio,
        fontSize: 16 * midRatio,
        // lineHeight: 32 * midRatio,
        text: 'Text in Group',
      }),
      createMaterial('image', {
        id: 'test-005',
        x: 80 * xRatio,
        y: 80 * yRatio,
        width: 80 * xRatio,
        height: 80 * yRatio,
        src: 'https://example.com/002.png',
      }),
      createMaterial('group', {
        id: 'test-100',
        x: 500 * xRatio,
        y: 500 * yRatio,
        width: 1000 * xRatio,
        height: 1000 * yRatio,
        children: [
          createMaterial('rect', {
            id: 'test-101',
            x: 20 * xRatio,
            y: 20 * yRatio,
            width: 20 * xRatio,
            height: 20 * yRatio,
          }),
          createMaterial('circle', {
            id: 'test-102',
            x: 40 * xRatio,
            y: 40 * yRatio,
            width: 40 * xRatio,
            height: 40 * yRatio,
          }),
          createMaterial('text', {
            id: 'test-103',
            x: 60 * xRatio,
            y: 60 * yRatio,
            width: 60 * xRatio,
            height: 60 * yRatio,
            fontSize: 16 * midRatio,
            text: 'Text in Group',
          }),
          createMaterial('image', {
            id: 'test-104',
            x: 80 * xRatio,
            y: 80 * yRatio,
            width: 80 * xRatio,
            height: 80 * yRatio,
            src: 'https://example.com/002.png',
          }),
        ],
      }),
    ],
    operations: {
      resizeEffect: 'deepResize',
    },
  });

  return group;
};

const createGroupByFixed = (opts: { moveX: number; moveY: number; moveW: number; moveH: number }) => {
  const { moveX, moveY, moveW, moveH } = opts || {};

  const group: StrictMaterial<'group'> = createMaterial('group', {
    id: 'test-001',
    x: 10 + moveX,
    y: 10 + moveY,
    width: 2000 + moveW,
    height: 2000 + moveH,
    children: [
      createMaterial('rect', { id: 'test-002', x: 20 - moveX, y: 20 - moveY, width: 20, height: 20 }),
      createMaterial('circle', { id: 'test-003', x: 40 - moveX, y: 40 - moveY, width: 40, height: 40 }),
      createMaterial('text', {
        id: 'test-004',
        x: 60 - moveX,
        y: 60 - moveY,
        width: 60,
        height: 60,
        fontSize: 16,
        text: 'Text in Group',
      }),
      createMaterial('image', {
        id: 'test-005',
        x: 80 - moveX,
        y: 80 - moveY,
        width: 80,
        height: 80,
        src: 'https://example.com/002.png',
      }),
      createMaterial('group', {
        id: 'test-100',
        x: 500 - moveX,
        y: 500 - moveY,
        width: 1000,
        height: 1000,
        children: [
          createMaterial('rect', {
            id: 'test-101',
            x: 20,
            y: 20,
            width: 20,
            height: 20,
          }),
          createMaterial('circle', {
            id: 'test-102',
            x: 40,
            y: 40,
            width: 40,
            height: 40,
          }),
          createMaterial('text', {
            id: 'test-103',
            x: 60,
            y: 60,
            width: 60,
            height: 60,
            fontSize: 16,
            text: 'Text in Group',
          }),
          createMaterial('image', {
            id: 'test-104',
            x: 80,
            y: 80,
            width: 80,
            height: 80,
            src: 'https://example.com/002.png',
          }),
        ],
      }),
    ],
    operations: {
      resizeEffect: 'deepResize',
    },
  });
  return group;
};

describe('resizeEffectGroupMaterial', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));
  });

  test('deepSize', () => {
    const group = createGroupByRatio();
    const xRatio = 2;
    const yRatio = 3;

    const record = resizeEffectGroupMaterial(
      group,
      {
        width: group.width * xRatio,
        height: group.height * yRatio,
      },
      {
        resizeEffect: 'deepResize',
      }
    );

    expect(group).toStrictEqual(
      createGroupByRatio({
        xRatio,
        yRatio,
      })
    );

    expect(record).toStrictEqual({
      type: 'resizeMaterials',
      time: 1735689600000,
      content: {
        method: 'modifyMaterials',
        before: [
          { id: 'test-001', x: 10, y: 10, width: 2000, height: 2000 },
          { x: 20, y: 20, width: 20, height: 20, id: 'test-002' },
          { x: 40, y: 40, width: 40, height: 40, id: 'test-003' },
          { x: 60, y: 60, width: 60, height: 60, id: 'test-004', fontSize: 16 },
          { x: 80, y: 80, width: 80, height: 80, id: 'test-005' },
          { x: 500, y: 500, width: 1000, height: 1000, id: 'test-100' },
          { x: 20, y: 20, width: 20, height: 20, id: 'test-101' },
          { x: 40, y: 40, width: 40, height: 40, id: 'test-102' },
          { x: 60, y: 60, width: 60, height: 60, id: 'test-103', fontSize: 16 },
          { x: 80, y: 80, width: 80, height: 80, id: 'test-104' },
        ],
        after: [
          { id: 'test-001', x: 10, y: 10, width: 4000, height: 6000 },
          { x: 40, y: 60, width: 40, height: 60, id: 'test-002' },
          { x: 80, y: 120, width: 80, height: 120, id: 'test-003' },
          { x: 120, y: 180, width: 120, height: 180, id: 'test-004', fontSize: 40 },
          { x: 160, y: 240, width: 160, height: 240, id: 'test-005' },
          { x: 1000, y: 1500, width: 2000, height: 3000, id: 'test-100' },
          { x: 40, y: 60, width: 40, height: 60, id: 'test-101' },
          { x: 80, y: 120, width: 80, height: 120, id: 'test-102' },
          { x: 120, y: 180, width: 120, height: 180, id: 'test-103', fontSize: 40 },
          { x: 160, y: 240, width: 160, height: 240, id: 'test-104' },
        ],
      },
    });
  });

  test('fixed', () => {
    const group = createGroupByRatio();
    const moveX = 99;
    const moveY = 88;
    const moveW = 77;
    const moveH = 66;

    const record = resizeEffectGroupMaterial(
      group,
      {
        x: group.x + moveX,
        y: group.y + moveY,
        width: group.width + moveW,
        height: group.height + moveH,
      },
      {
        resizeEffect: 'fixed',
      }
    );

    expect(group).toStrictEqual(
      createGroupByFixed({
        moveX,
        moveY,
        moveW,
        moveH,
      })
    );

    expect(record).toStrictEqual({
      type: 'resizeMaterials',
      time: 1735689600000,
      content: {
        method: 'modifyMaterials',
        before: [
          { id: 'test-001', x: 10, y: 10, width: 2000, height: 2000 },
          { id: 'test-002', x: 20, y: 20 },
          { id: 'test-003', x: 40, y: 40 },
          { id: 'test-004', x: 60, y: 60 },
          { id: 'test-005', x: 80, y: 80 },
          { id: 'test-100', x: 500, y: 500 },
        ],
        after: [
          { id: 'test-001', x: 109, y: 98, width: 2077, height: 2066 },
          { id: 'test-002', x: -79, y: -68 },
          { id: 'test-003', x: -59, y: -48 },
          { id: 'test-004', x: -39, y: -28 },
          { id: 'test-005', x: -19, y: -8 },
          { id: 'test-100', x: 401, y: 412 },
        ],
      },
    });
  });
});
