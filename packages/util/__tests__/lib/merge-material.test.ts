import type { Material } from '@idraw/types';
import { mergeMaterial } from '@idraw/util';

const material: Material = {
  id: 'z001zeaa-5c52-590c-f8a2-d2d89d25471f',
  type: 'rect',
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  fill: {
    type: 'linear-gradient',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 200 },
    stops: [
      { offset: 0, color: '#009688' },
      { offset: 0.5, color: '#ffeb3b' },
      { offset: 1, color: '#ff5722' },
    ],
  },
};

describe('@idraw/util mergeMaterial', () => {
  test('mergeMaterial', () => {
    const result = mergeMaterial(material, {
      fill: {
        stops: [
          { offset: 0, color: '#009688' },
          { offset: 1, color: '#ff5722' },
        ],
      },
    });
  });
});
