export { delay, compose, throttle, debounce } from './tool/time';
export {
  downloadImageFromCanvas,
  parseFileToBase64,
  pickFile,
  parseFileToText,
  downloadFileFromText,
} from './tool/file';
export {
  toColorHexStr,
  toColorHexNum,
  isColorStr,
  colorNameToHex,
  colorToCSS,
  colorToLinearGradientCSS,
  mergeHexColorAlpha,
} from './tool/color';
export { createUUID, isAssetId, createAssetId } from './tool/uuid';
export { deepClone, sortDataAsserts, deepCloneMaterial, deepCloneData, filterCompactData } from './view/data';
export { istype } from './tool/istype';
export { loadImage, loadSVGCode, loadForeignObject } from './view/load';
export { is } from './view/is';
export { check } from './view/check';
export { createBoardContent, createContext2D, createOffscreenContext2D } from './view/canvas';
export { EventEmitter } from './tool/event';
export {
  calcDistance,
  // calcSpeed,
  // equalPoint,
  // equalTouchPoint,
  // vaildPoint,
  // vaildTouchPoint,
  getCenterFromTwoPoints,
} from './view/point';
export { Store } from './tool/store';
export { parseXMLToDataURL, parseSVGCodeToDataURL } from './view/parser';
export {
  convertSVGPathToContext2DCommands,
  convertPathCommandsToContext2DCommands,
  convertContext2DCommandsToSVGPath,
} from './tool/path-to-command';
export { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot, getMiddlewareValidStyles } from './view/middleware';
export { Context2D } from './view/context2d';
export {
  rotateMaterial,
  parseRadianToAngle,
  parseAngleToRadian,
  rotateMaterialVertexes,
  getMaterialRotateVertexes,
  calcMaterialCenter,
  calcMaterialCenterFromVertexes,
  rotatePointInGroup,
  limitAngle,
  calcRadian,
} from './view/rotate';
export {
  getSelectedMaterialUUIDs,
  validateMaterials,
  calcMaterialsContextSize,
  calcMaterialsViewInfo,
  getMaterialsAssetIds,
  findMaterialFromList,
  findMaterialsFromList,
  findMaterialFromListByPosition,
  findMaterialQueueFromListByPosition,
  findMaterialsFromListByPositions,
  getGroupQueueFromList,
  getMaterialAndGroupQueueFromList,
  getGroupQueueByMaterialPosition,
  getMaterialSize,
  mergeMaterialAsset,
  filterMaterialAsset,
  isResourceMaterial,
  getMaterialPositionFromList,
  getMaterialPositionMapFromList,
  calcMaterialListSize,
  isSameMaterialSize,
} from './view/material';
export { checkRectIntersect } from './view/rect';
export {
  viewScale,
  viewScroll,
  calcViewMaterialSize,
  calcViewPoint,
  calcPointFromView,
  calcViewVertexes,
  isViewPointInMaterial,
  getViewPointAtMaterial,
  isMaterialInView,
  calcViewScaleInfo,
  calcMaterialViewBoundingInfo,
  calcMaterialBoundingInfo,
  boundingInfoToRangeBoundingInfo,
  isViewPointInMaterialSize,
  isViewPointInVertexes,
} from './view/view-calc';
export { rotatePoint, rotateVertexes, rotateByCenter } from './view/rotate';
export {
  getMaterialVertexes,
  calcMaterialVertexesInGroup,
  calcMaterialVertexesQueueInGroup,
  calcMaterialQueueVertexesQueueInGroup,
} from './view/vertex';
export { calcMaterialSizeController, calcLayoutSizeController } from './view/controller';
export { convertPathCommandsToStr, parseSVGPath } from './tool/svg-path';
export { generateHTML, parseHTML } from './tool/html';
export { compressImage } from './tool/image';
export { formatNumber } from './tool/number';
export { matrixToAngle, matrixToRadian } from './view/matrix';
export { getDefaultMaterialAttributes, getDefaultMaterialRectAttributes } from './view/static';
export { calcVisiableViewSize } from './view/view-box';
export {
  mergeMaterial,
  createMaterial,
  insertMaterialToListByPosition,
  deleteMaterialInListByPosition,
  deleteMaterialInList,
  moveMaterialPosition,
  updateMaterialInList,
  updateMaterialInListByPosition,
} from './view/handle-material';
export { resizeEffectGroupMaterial } from './view/resize-material';
export { calcViewCenterContent, calcViewCenter } from './view/view-content';
export { toFlattenMaterial, toFlattenLayout, toFlattenGlobal } from './view/modify-record';
export { enhanceFontFamliy } from './view/text';
export { flatMaterialList } from './view/flat';
export { groupMaterialsByPosition, ungroupMaterialsByPosition } from './view/group';
export { calcPointMoveMaterialInGroup } from './view/point-move-material';
export { mergeLayout } from './view/handle-layout';
export { mergeGlobal } from './view/handle-global';
export { calcRevertMovePosition, calcResultMovePosition } from './view/position';
export { refinePathMaterial } from './view/path';
export {
  createHTMLElement,
  assembleHTMLElement,
  setHTMLCSSProps,
  sanitizeHTMLStr,
  parseHTMLStr,
  addClassName,
  removeClassName,
  getHTMLElementRectInPage,
  bubbleHTMLElement,
  isPointInMiddlewareElement,
} from './view/dom';
export { parseStyles, injectStyles, removeStyles } from './view/styles';

export { merge } from './tool/merge';
export { omit } from './tool/omit';
// export { materialToBoxInfo } from './view/box';
export { get, set, toPath } from './tool/get-set-del';
export { flatObject } from './tool/flat-object';
export { unflatObject } from './tool/unflat-object';
export { calcSVGPathBoundingBox, calcPathCommondsBoundingBox } from './tool/path-to-box';
export { createId } from './tool/id';
export {
  shiftPathCommands,
  shiftPathCommand,
  scalePathCommands,
  convertPathCommandsToACLMZ,
  moveInAnchorCommands,
  moveCurveCtrlInAnchorCommands,
  convertLineToExactCurveCommand,
} from './tool/path';

// converter
export { svgToMaterial } from './converter/svg-material';
export { materialToSVG } from './converter/material-svg';
export { dataToSVG } from './converter/data-svg';
export { ATTR_VALID_WATCH } from './static';
