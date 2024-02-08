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
export const keyGroupQueue = Symbol(`${key}_groupQueue`); // Array<Element<'group'>> | []
export const keyGroupQueueVertexesList = Symbol(`${key}_groupQueueVertexesList`); // Array<ViewRectVertexes> | []

export const keyDebugElemCenter = Symbol(`${key}_debug_elemCenter`);
export const keyDebugStartVertical = Symbol(`${key}_debug_startVertical`);
export const keyDebugEndVertical = Symbol(`${key}_debug_endVertical`);
export const keyDebugStartHorizontal = Symbol(`${key}_debug_startHorizontal`);
export const keyDebugEndHorizontal = Symbol(`${key}_debug_endHorizontal`);
export const keyDebugEnd0 = Symbol(`${key}_debug_end0`);

export const selectWrapperBorderWidth = 2;
export const resizeControllerBorderWidth = 4;
export const areaBorderWidth = 1;
export const wrapperColor = '#1973ba';

export const lockColor = '#5b5959b5';

export const controllerSize = 10;
// export const wrapperColor = '#1890ff';
