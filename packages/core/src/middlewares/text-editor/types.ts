import type { StrictMaterial, ViewScaleInfo, MaterialPosition, MiddlewareTextEditorStyles } from '@idraw/types';
import { coreEventKeys } from '../../static';

export type TextEditEvent = {
  id: string;
};

export type InnerOptions = {
  material: StrictMaterial<'text'>;
  groupQueue: StrictMaterial<'group'>[];
  viewScaleInfo: ViewScaleInfo;
  styles: MiddlewareTextEditorStyles;
};

export type TextChangeEvent = {
  material: {
    id: string;
    attributes: {
      text: string;
    };
  };
  position: MaterialPosition;
};

export type ExtendEventMap = Record<typeof coreEventKeys.TEXT_EDIT, TextEditEvent> &
  Record<typeof coreEventKeys.TEXT_CHANGE, TextChangeEvent>;
