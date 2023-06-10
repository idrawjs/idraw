export const key = 'SELECT';
export const keyHoverElementSize = Symbol(`${key}_hoverElementSize`);
export const keyActionType = Symbol(`${key}_actionType`); // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
export const keyResizeType = Symbol(`${key}_resizeType`); // ResizeType | null;
export const keyAreaStart = Symbol(`${key}_areaStart`); // Point
export const keyAreaEnd = Symbol(`${key}_areaEnd`); // Point
export const keyInGroupQueue = Symbol(`${key}_targetQueue`); // Element<'group'>[]

// export const keyHoverElementSize = `${key}_hoverElementSize`;
// export const keyActionType = `${key}_actionType`; // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
// export const keyResizeType = `${key}_resizeType`; // ResizeType | null;
// export const keyAreaStart = `${key}_areaStart`; // Point
// export const keyAreaEnd = `${key}_areaEnd`; // Point
// export const keyInGroupQueue = `${key}_targetQueue`; // Element<'group'>[]
