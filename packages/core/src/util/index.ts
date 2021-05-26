import { loadImage } from './loader';
import { delay, compose, throttle } from './time';
import { downloadImageFromCanvas } from './file';
import { toColorHexStr, toColorHexNum } from './color';

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
  }
}