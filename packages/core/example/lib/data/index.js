import dataRect from './rect.js';
import dataImage from './image.js';
import dataSVG from './svg.js';

const url = new URLSearchParams(window.location.search);

const dataMap = {
  'rect': dataRect,
  'image': dataImage,
  'svg': dataSVG, 
}

export function getData() {
  return dataMap[url.get('data')] || dataMap['rect'];
}