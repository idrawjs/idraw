import { IDrawData } from './data';
import { DataElemDesc, DataElement } from './element';
import { IDrawContext } from './context';
import { Point, PointCursor } from './board';

export type HelperPluginEventDetail = {
  controller: string | null;
  point: Point;
  selectedElement: DataElement<keyof DataElemDesc> | null;
  data: IDrawData;
  helperCtx: IDrawContext;
};

export type HelperPluginEventResult = {
  cursor?: PointCursor;
  beController?: boolean;
};

export interface InterfaceHelperPlugin {
  readonly name?: string;

  readonly uuid?: string;

  onHover?: (detail: HelperPluginEventDetail) => void | HelperPluginEventResult;

  onPoint?: (detail: HelperPluginEventDetail) => void | HelperPluginEventResult;

  onClick?: (detail: HelperPluginEventDetail) => void | HelperPluginEventResult;

  onMoveStart?: (
    detail: HelperPluginEventDetail
  ) => void | HelperPluginEventResult;

  onMove?: (detail: HelperPluginEventDetail) => void | HelperPluginEventResult;

  onMoveEnd?: (
    detail: HelperPluginEventDetail
  ) => void | HelperPluginEventResult;
}
