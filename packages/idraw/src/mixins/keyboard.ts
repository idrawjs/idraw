import util from '@idraw/util';
import iDraw from './../index';
import { _tempData } from './../names';

export function copyElements(idraw: iDraw) {
  if (idraw[_tempData].get('isHover') !== true) {
    return;
  }
  const elems = idraw.getSelectedElements();
  idraw[_tempData].set('clipboardElements', util.data.deepClone(elems));
}

export function pasteElements(idraw: iDraw) {
  if (idraw[_tempData].get('isHover') !== true) {
    return;
  }
  const elems = idraw[_tempData].get('clipboardElements');
  const moveRate = 0.1;
  elems.forEach((elem) => {
    elem.x += elem.w * moveRate;
    elem.y += elem.w * moveRate;
    idraw.addElement(elem);
  });
  idraw[_tempData].set('clipboardElements', []);
}