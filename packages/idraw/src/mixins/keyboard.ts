import util from '@idraw/util';
import { TypeElement, TypeElemDesc } from '@idraw/types';
import iDraw from './../index';
import { _tempData } from './../names';

export function copyElements(idraw: iDraw) {
  if (idraw[_tempData].get('isHover') !== true) {
    return;
  }
  const elems = util.data.deepClone(idraw.getSelectedElements());
  idraw[_tempData].set('clipboardElements', elems);
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

export function cutElements(idraw: iDraw) {
  if (idraw[_tempData].get('isHover') !== true) {
    return;
  }
  const elems = util.data.deepClone(idraw.getSelectedElements());
  elems.forEach((elem: TypeElement<keyof TypeElemDesc>) => {
    idraw.deleteElement(elem.uuid);
  })
  idraw[_tempData].set('clipboardElements', elems);
}

export function deleteElements(idraw: iDraw) {
  if (idraw[_tempData].get('isHover') !== true) {
    return;
  }
  const elems = util.data.deepClone(idraw.getSelectedElements());
  elems.forEach((elem: TypeElement<keyof TypeElemDesc>) => {
    idraw.deleteElement(elem.uuid);
  });
}