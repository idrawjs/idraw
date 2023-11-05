import type { ElementBaseDetail } from './element';

export type DefaultElementDetailConfig = Required<Omit<ElementBaseDetail, 'clipPath' | 'background'>>;
