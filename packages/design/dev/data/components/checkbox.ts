import { createUUID } from '@idraw/util';
import type { ElementSize } from '@idraw/types';
import type { DesignComponent, DesignComponentItem } from '../../../src';

function createCheckboxItem(variantName: string) {
  const componentItem: DesignComponentItem = {
    uuid: createUUID(),
    type: 'component-item',
    name: `Checkbox ${variantName}`,
    x: 50,
    y: 50,
    w: 100,
    h: 100,
    detail: {
      children: [
        {
          uuid: createUUID(),
          type: 'rect',
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
          type: 'rect',
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
          type: 'rect',
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
          type: 'rect',
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
          type: 'rect',
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

export function createCheckbox(name: string, size?: Partial<ElementSize>) {
  const checkbox: DesignComponent = {
    uuid: createUUID(),
    type: 'component',
    name: `Checkbox ${name}`,
    x: 50,
    y: 50,
    w: 360,
    h: 200,
    detail: {
      bgColor: '#aaaaaa54',
      default: createCheckboxItem('default'),
      variants: [createCheckboxItem('primary'), createCheckboxItem('secondary')]
    },
    ...(size || {})
  };
  return checkbox;
}
