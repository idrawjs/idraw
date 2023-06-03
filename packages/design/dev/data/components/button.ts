import { createUUID } from '@idraw/util';
import type { DesignComponent, DesignComponentItem } from '../../../src';

function createButtonItem(variantName: string) {
  const componentItem: DesignComponentItem = {
    uuid: createUUID(),
    type: 'component-item',
    name: `Button ${variantName}`,
    x: 50,
    y: 50,
    w: 100,
    h: 100,
    desc: {
      children: [
        {
          uuid: createUUID(),
          type: 'circle',
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
          type: 'circle',
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
          type: 'circle',
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
          type: 'circle',
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
          type: 'circle',
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

export function createButton(name: string) {
  const button: DesignComponent = {
    uuid: createUUID(),
    type: 'component',
    name: `Button ${name}`,
    x: 50,
    y: 50,
    w: 800,
    h: 400,
    desc: {
      default: createButtonItem('default'),
      variants: [createButtonItem('primary'), createButtonItem('secondary')]
    }
  };
  return button;
}
