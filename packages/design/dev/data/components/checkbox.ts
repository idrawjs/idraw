import { createUUID } from '@idraw/util';
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
    desc: {
      children: [
        {
          uuid: createUUID(),
          type: 'rect',
          x: -40,
          y: 0,
          w: 100,
          h: 100,
          desc: {
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
          desc: {
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
          desc: {
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
          desc: {
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
          desc: {
            bgColor: '#4caf50'
          }
        }
      ]
    }
  };
  return componentItem;
}

export function createCheckbox(name: string) {
  const checkbox: DesignComponent = {
    uuid: createUUID(),
    type: 'component',
    name: `Checkbox ${name}`,
    x: 50,
    y: 50,
    w: 800,
    h: 400,
    desc: {
      default: createCheckboxItem('default'),
      variants: [createCheckboxItem('primary'), createCheckboxItem('secondary')]
    }
  };
  return checkbox;
}
