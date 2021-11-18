import { TypeData } from './data';
import { TypeElemDesc, TypeElement } from './element';
import { TypeContext } from './context';
import { TypePoint, TypePointCursor } from './board';


export interface InterfacePlugin {
  onHover?: (detail: {
    point: TypePoint,
    selectedElement: TypeElement<keyof TypeElemDesc> | null,
    data: TypeData, 
    helperCtx:TypeContext,
  }) => void | { cursor?: TypePointCursor };
  onClick?: (detail: {
    point: TypePoint,
    selectedElement: TypeElement<keyof TypeElemDesc> | null,
    data: TypeData, 
    helperCtx:TypeContext
  }) => void;
  onMoveStart?: (detail: {
    point: TypePoint,
    selectedElement: TypeElement<keyof TypeElemDesc> | null,
    data: TypeData, 
    helperCtx:TypeContext
  }) => void;
  onMove?: (detail: {
    point: TypePoint,
    selectedElement: TypeElement<keyof TypeElemDesc> | null,
    data: TypeData, 
    helperCtx:TypeContext
  }) => void;
  onMoveEnd?: (detail: {
    point: TypePoint,
    selectedElement?: TypeElement<keyof TypeElemDesc> | null,
    data: TypeData, 
    helperCtx:TypeContext
  }) => void;
}