import type { MiddlewareSelectorStyle } from '@idraw/types';

export const key = 'SELECT';
// export const keyHoverElement = Symbol(`${key}_hoverElementSize`);
export const keyActionType = Symbol(`${key}_actionType`); // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
export const keyResizeType = Symbol(`${key}_resizeType`); // ResizeType | null;
export const keyAreaStart = Symbol(`${key}_areaStart`); // Point
export const keyAreaEnd = Symbol(`${key}_areaEnd`); // Point

export const keyHoverElement = Symbol(`${key}_hoverElement`); // Element<ElementType> | []
export const keyHoverElementVertexes = Symbol(`${key}_hoverElementVertexes`); // ViewRectVertexes | null
export const keySelectedElementList = Symbol(`${key}_selectedElementList`); // Array<Element<ElementType>> | []
export const keySelectedElementListVertexes = Symbol(`${key}_selectedElementListVertexes`); // ViewRectVertexes | null
export const keySelectedElementController = Symbol(`${key}_selectedElementController`); // ElementSizeController
export const keySelectedElementPosition = Symbol(`${key}_selectedElementPosition`); // ElementPosition | []
export const keyGroupQueue = Symbol(`${key}_groupQueue`); // Array<Element<'group'>> | []
export const keyGroupQueueVertexesList = Symbol(`${key}_groupQueueVertexesList`); // Array<ViewRectVertexes> | []
export const keyIsMoving = Symbol(`${key}_isMoving`); // boolean | null
export const keyEnableSelectInGroup = Symbol(`${key}_enableSelectInGroup`);
export const keyEnableSnapToGrid = Symbol(`${key}_enableSnapToGrid`);

export const keyDebugElemCenter = Symbol(`${key}_debug_elemCenter`);
export const keyDebugStartVertical = Symbol(`${key}_debug_startVertical`);
export const keyDebugEndVertical = Symbol(`${key}_debug_endVertical`);
export const keyDebugStartHorizontal = Symbol(`${key}_debug_startHorizontal`);
export const keyDebugEndHorizontal = Symbol(`${key}_debug_endHorizontal`);
export const keyDebugEnd0 = Symbol(`${key}_debug_end0`);

export const selectWrapperBorderWidth = 2;
export const resizeControllerBorderWidth = 4;
export const areaBorderWidth = 1;
export const controllerSize = 10;

// export const rotateControllerSize = 16;

export const rotateControllerSize = 20;
export const rotateControllerPosition = 22;

const activeColor = '#1973ba';
const activeAreaColor = '#1976d21c';
const lockedColor = '#5b5959b5';
const referenceColor = '#f7276e';

export const defaultStyle: MiddlewareSelectorStyle = {
  activeColor,
  activeAreaColor,
  lockedColor,
  referenceColor
};
