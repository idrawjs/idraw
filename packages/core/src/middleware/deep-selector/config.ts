export const key = 'SELECT';
export const keyHoverElementSize = Symbol(`${key}_hoverElementSize`);
export const keyActionType = Symbol(`${key}_actionType`); // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
export const keyResizeType = Symbol(`${key}_resizeType`); // ResizeType | null;
export const keyAreaStart = Symbol(`${key}_areaStart`); // Point
export const keyAreaEnd = Symbol(`${key}_areaEnd`); // Point
export const keyGroupQueue = Symbol(`${key}_groupQueue`); // Element<'group'>[]
export const keyInGroup = Symbol(`${key}_inGroup`); // Element<'group'>[]

// export const keyHoverElementSize = `${key}_hoverElementSize`;
// export const keyActionType = `${key}_actionType`; // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
// export const keyResizeType = `${key}_resizeType`; // ResizeType | null;
// export const keyAreaStart = `${key}_areaStart`; // Point
// export const keyAreaEnd = `${key}_areaEnd`; // Point
// export const keyGroupQueue = `${key}_targetQueue`; // Element<'group'>[]
