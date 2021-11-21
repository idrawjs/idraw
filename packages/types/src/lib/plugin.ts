import { TypeData } from './data';
import { TypeElemDesc, TypeElement } from './element';
import { TypeContext } from './context';
import { TypePoint, TypePointCursor } from './board';

export type TypeHelperPluginEventDetail = {
  controller: string | null,
  point: TypePoint,
  selectedElement: TypeElement<keyof TypeElemDesc> | null,
  data: TypeData, 
  helperCtx:TypeContext,
}

export type TypeHelperPluginEventResult = {
  cursor?: TypePointCursor,
  beController?: boolean;
}

export interface InterfaceHelperPlugin {

  readonly name?: string;

  readonly uuid?: string;
 
  onHover?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;

  onPoint?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;

  onClick?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;

  onMoveStart?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;

  onMove?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;

  onMoveEnd?: (detail: TypeHelperPluginEventDetail) => void | TypeHelperPluginEventResult;
}