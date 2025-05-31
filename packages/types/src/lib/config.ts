import type { ElementBaseDetail, ElementTextDetail, ElementGroupDetail } from './element';

export type DefaultElementDetailConfig = Required<
  Omit<ElementBaseDetail, 'clipPath' | 'clipPathStrokeWidth' | 'clipPathStrokeColor' | 'background'>
> &
  Required<
    Pick<
      ElementTextDetail,
      'color' | 'textAlign' | 'verticalAlign' | 'fontSize' | 'fontFamily' | 'fontWeight' | 'minInlineSize' | 'wordBreak'
    >
  > &
  Required<Pick<ElementGroupDetail, 'overflow'>>;
