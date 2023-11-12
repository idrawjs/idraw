import type { ElementBaseDetail, ElementTextDetail } from './element';

export type DefaultElementDetailConfig = Required<Omit<ElementBaseDetail, 'clipPath' | 'background'>> &
  Required<Pick<ElementTextDetail, 'color' | 'textAlign' | 'verticalAlign' | 'fontSize' | 'fontFamily' | 'fontWeight' | 'lineHeight'>>;
