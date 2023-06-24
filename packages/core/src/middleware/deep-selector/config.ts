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

export const resizeControllerBorderWidth = 2;
export const wrapperColor = '#1973ba';
