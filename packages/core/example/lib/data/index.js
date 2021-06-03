import dataRect from './rect.js';
import dataImage from './image.js';
import dataSVG from './svg.js';
import dataText from './text.js';

const url = new URLSearchParams(window.location.search);

const dataMap = {
  'rect': dataRect,
  'image': dataImage,
  'svg': dataSVG, 
  'text': dataText
}

export function getData() {
  return dataMap[url.get('data')] || dataMap['rect'];
}