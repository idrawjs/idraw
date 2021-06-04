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
  return dataMap[getPageName()] || dataMap[url.get('data')] || dataMap['rect'];
}

function getPageName() {
  // const pathname = window.location.pathname || '';
  // const reg = /(?<pageName>[\w+]{1,})\.html$/;
  // const page = reg.exec(pathname)?.groups?.pageName || '';
  // return page;

  const pathname = window.location.pathname || '';
  const list = pathname.split('/');
  let pageName = list.pop() || '';
  pageName = pageName.replace(/\.html$/ig, '');
  return pageName;

  // return getQueryString('data') || 'rect';
}


// function getQueryString(name) {
//   let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
//   let r = window.location.search.substr(1).match(reg);
//   if (r != null) {
//       return decodeURIComponent(r[2]);
//   };
//   return null;
// }