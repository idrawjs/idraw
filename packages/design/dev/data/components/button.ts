import { createUUID } from '@idraw/util';
import type { ElementSize } from '@idraw/types';
import type { DesignComponent, DesignComponentItem } from '../../../src';

function createButtonItem(variantName: string, size?: Partial<ElementSize>) {
  const componentItem: DesignComponentItem = {
    uuid: createUUID(),
    type: 'component-item',
    name: `Button ${variantName}`,
    x: 50,
    y: 50,
    w: 100,
    h: 100,
    ...(size || {}),
    detail: {
      children: [
        {
          uuid: createUUID(),
          type: 'circle',
          x: -40,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            bgColor: '#f44336'
          }
        },
        {
          uuid: createUUID(),
          type: 'circle',
          x: -20,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            bgColor: '#ff9800'
          }
        },
        {
          uuid: createUUID(),
          type: 'circle',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            bgColor: '#ffc106'
          }
        },
        {
          uuid: createUUID(),
          type: 'circle',
          x: 20,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            bgColor: '#cddc39'
          }
        },
        {
          uuid: createUUID(),
          type: 'circle',
          x: 40,
          y: 0,
          w: 100,
          h: 100,
          detail: {
            bgColor: '#4caf50'
          }
        }
      ]
    }
  };
  return componentItem;
}

export function createButton(name: string, size?: Partial<ElementSize>) {
  const button: DesignComponent = {
    uuid: createUUID(),
    type: 'component',
    name: `Button ${name}`,
    x: 50,
    y: 50,
    w: 360,
    h: 200,
    detail: {
      bgColor: '#aaaaaa54',
      default: createButtonItem('default'),
      variants: [createButtonItem('primary', { x: 200, y: 50, angle: 30 }), createButtonItem('secondary', { x: 50, y: 180 })]
    },
    ...(size || {})
  };
  return button;
}
