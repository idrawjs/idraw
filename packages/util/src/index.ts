import { loadImage } from './lib/loader';
import { delay, compose, throttle } from './lib/time';
import { downloadImageFromCanvas } from './lib/file';
import { toColorHexStr, toColorHexNum, isColorStr } from './lib/color';
import { createUUID } from './lib/uuid';
import istype from './lib/istype';

export default {
  time: {
    delay,
    compose,
    throttle,
  },
  loader: {
    loadImage
  },
  file: {
    downloadImageFromCanvas,
  },
  color: {
    toColorHexStr,
    toColorHexNum,
    isColorStr,
  },
  uuid: {
    createUUID
  },
  istype,
};