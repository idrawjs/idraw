import type { MiddlewareSelectorStyles, StoreSharer } from '@idraw/types';
import { createId } from '@idraw/util';
import type { DeepSelectorSharedStorage } from './types';

export const key = 'SELECTOR';

export const prefix = `idraw-middleware-selector`;
export const getRootClassName = () => `${prefix}-${createId()}`;

// export const ATTR_MATERIAL_TYPE = 'data-idraw-material-type';
export const ATTR_BOX_TYPE = 'data-idraw-box-type';
export const ATTR_MATERIAL_ID = 'data-idraw-material-id';
export const ATTR_HANDLER_TYPE = 'data-idraw-handler-type';

export const BOX_GROUP = 'box-group';
export const BOX_TARGET = 'box-material';

export const classNameMap = {
  // common material box
  materialBox: `${prefix}-materialBox`,
  groupBox: `${prefix}-groupBox`,

  // nestedBox
  nestedBox: `${prefix}-nestedBox`,
  nestedTargetBox: `${prefix}-nestedTargetBox`,

  // hoverBox
  hoverBox: `${prefix}-hoverBox`,
  hoverTargetBox: `${prefix}-hoverTargetBox`,

  // lockedBox
  lockedBox: `${prefix}-lockedBox`,
  lockedTargetBox: `${prefix}-lockedTargetBox`,

  // selected Box
  selectedBox: `${prefix}-selectedBox`,
  selectedTargetBox: `${prefix}-selectedTargetBox`,

  // handlerBox
  hideHandler: `${prefix}-hideHandler`,
  // edge handler
  edgeHandler: `${prefix}-edgeHandler`,
  edgeTopHandler: `${prefix}-edgeTopHandler`,
  edgeRightHandler: `${prefix}-edgeRightandler`,
  edgeBottomHandler: `${prefix}-edgeBottomHandler`,
  edgeLeftHandler: `${prefix}-edgeLeftHandler`,
  // corner handler
  cornerHandler: `${prefix}-cornerHandler`,
  cornerTopLeftHandler: `${prefix}-cornerTopLeftHandler`,
  cornerTopRightHandler: `${prefix}-cornerTopRightHandler`,
  cornerBottomLeftHandler: `${prefix}-cornerBottomLeftHandler`,
  cornerBottomRightHandler: `${prefix}-cornerBottomRightHandler`,
  // rotate handler
  rotateHandler: `${prefix}-rotateHandler`,

  // selection area
  selectionAreaBox: `${prefix}-selectionAreaBox`,
};

export const keyPrevPoint = Symbol(`${key}_prevPoint`); // Point | null = null;
export const keyPointStartMaterialSizeList = Symbol(`${key}_pointStartMaterialSizeList`); //  Array<Partial<MaterialSize> & { id: string }> = [];
export const keyMoveOriginalStartPoint = Symbol(`${key}_moveOriginalStartPoint`); //  Point | null = null;
export const keyMoveOriginalStartMaterialSize = Symbol(`${key}_moveOriginalStartMaterialSize`); // MaterialSize | null = null;
export const keyInBusyMode = Symbol(`${key}_inBusyMode`); //  'resize' | 'drag' | 'drag-list' | 'area' | null = null;
export const keyHasChangedData = Symbol(`${key}_hasChangedData`); // boolean | null = null;
export const keyStartResizeGroupRecord = Symbol(`${key}_startResizeGroupRecord`); //  ModifyRecord<'resizeMaterials'> | null = null;
export const keyEndResizeGroupRecord = Symbol(`${key}_endResizeGroupRecord`); //  ModifyRecord<'resizeMaterials'> | null = null;

export const keyActionType = Symbol(`${key}_actionType`); // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
export const keyResizeType = Symbol(`${key}_resizeType`); // ResizeType | null;
export const keyAreaStart = Symbol(`${key}_areaStart`); // Point
export const keyAreaEnd = Symbol(`${key}_areaEnd`); // Point

export const keyHoverMaterial = Symbol(`${key}_hoverMaterial`); // Material | []
export const keySelectedMaterialList = Symbol(`${key}_selectedMaterialList`); // Array<Material<MaterialType>> | []
export const keySelectedMaterialListVertexes = Symbol(`${key}_selectedMaterialListVertexes`); // ViewRectVertexes | null
export const keySelectedMaterialPosition = Symbol(`${key}_selectedMaterialPosition`); // MaterialPosition | []
export const keyGroupQueue = Symbol(`${key}_groupQueue`); // Array<Material<'group'>> | []
export const keyIsMoving = Symbol(`${key}_isMoving`); // boolean | null
export const keyEnableSelectInGroup = Symbol(`${key}_enableSelectInGroup`);
export const keyEnableSnapToGrid = Symbol(`${key}_enableSnapToGrid`);

export const selectedBoxBorderWidth = 1.5;
export const selectedNestedBoxBorderWidth = 2;
export const hoverBoxBorderWidth = 1;
export const lockedBoxBorderWidth = 2;

export const cornerHandlerSize = 10;
export const cornerHandlerBorderWidth = 1.5;
export const edgeHandlerSize = 10;
export const selectionAreaBorderWidth = 1;
export const rotateHandlerSize = 20;

export const defaultStyle: MiddlewareSelectorStyles = {
  zIndex: 1,
  activeColor: '#1973ba',

  handlerBorderColor: '#1973ba',
  handlerBackground: '#ffffff',
  handlerHoverBackground: '#aad4f6',
  handlerActiveBackground: '#63b8f8',

  selectionAreaBorderColor: '#1973ba',
  selectionAreaBackground: '#1973ba3f',
  lockedColor: '#5b5959b5',
  referenceColor: '#f7276e',
};

export const getSvgRotate = (
  currentColor: string
) => `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200" fill="${currentColor}" >
   <path d="M512 0c282.8 0 512 229.2 512 512s-229.2 512 -512 512S0 794.8 0 512 229.2 0 512 0zm309.8 253.8c0 -10.5 -6.5 -19.8 -15.7 -23.8 -9.7 -4 -21 -2 -28.2 5.6l-52.5 52c-56.9 -53.7 -133.9 -85.5 -213.4 -85.5 -170.7 0 -309.8 139.2 -309.8 309.8 0 170.6 139.2 309.8 309.8 309.8 92.4 0 179.5 -40.8 238.4 -111.8 4 -5.2 4 -12.9 -0.8 -17.3L694.3 637c-2.8 -2.4 -6.5 -3.6 -10.1 -3.6 -3.6 0.4 -7.3 2 -9.3 4.8 -39.5 51.2 -98.8 80.3 -163 80.3 -113.8 0 -206.5 -92.8 -206.5 -206.5 0 -113.8 92.8 -206.5 206.5 -206.5 52.8 0 102.9 20.2 140.8 55.3L597 416.5c-7.7 7.3 -9.7 18.6 -5.6 27.9 4 9.7 13.3 16.1 23.8 16.1H796c14.1 0 25.8 -11.7 25.8 -25.8V253.8z" />
</svg>`;

export const clearStorage = (sharer: StoreSharer<DeepSelectorSharedStorage>) => {
  sharer.setSharedStorage(keyStartResizeGroupRecord, null);
  sharer.setSharedStorage(keyEndResizeGroupRecord, null);

  sharer.setSharedStorage(keyActionType, null);
  sharer.setSharedStorage(keyResizeType, null);
  sharer.setSharedStorage(keyAreaStart, null);
  sharer.setSharedStorage(keyAreaEnd, null);
  sharer.setSharedStorage(keyGroupQueue, []);
  sharer.setSharedStorage(keyHoverMaterial, null);
  sharer.setSharedStorage(keySelectedMaterialList, []);
  sharer.setSharedStorage(keySelectedMaterialListVertexes, null);
  sharer.setSharedStorage(keySelectedMaterialPosition, []);
  sharer.setSharedStorage(keyIsMoving, null);
};
