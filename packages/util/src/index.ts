import { delay, compose, throttle } from './lib/time';
import { downloadImageFromCanvas } from './lib/file';
import { toColorHexStr, toColorHexNum, isColorStr } from './lib/color';
import { createUUID } from './lib/uuid';
import { deepClone } from './lib/data';
import istype from './lib/istype';
import { loadImage, loadSVG, loadHTML } from './lib/loader';
import Context from './lib/context';
import is from './lib/is';
import check from './lib/check'; 


export {
  is,
  check,
  delay,
  compose,
  throttle,
  loadImage,
  loadSVG,
  loadHTML,
  downloadImageFromCanvas,
  toColorHexStr,
  toColorHexNum,
  isColorStr,
  createUUID,
  istype,
  deepClone,
  Context,
}
