import { deepClone } from '@idraw/util';
import { DataElement, DataElemDesc } from '@idraw/types';
import iDraw from './../index';

export function copyElements(idraw: iDraw) {
  if (idraw.getTempData().get('isFocus') !== true) {
    return;
  }
  const elems = deepClone(idraw.getSelectedElements());
  idraw.getTempData().set('clipboardElements', elems);
}

export function pasteElements(idraw: iDraw) {
  if (idraw.getTempData().get('isFocus') !== true) {
    return;
  }
  const elems = idraw.getTempData().get('clipboardElements');
  const moveRate = 0.1;
  elems.forEach((elem) => {
    elem.x += elem.w * moveRate;
    elem.y += elem.w * moveRate;
    idraw.addElement(elem);
  });
  idraw.getTempData().set('clipboardElements', []);
}

export function cutElements(idraw: iDraw) {
  if (idraw.getTempData().get('isFocus') !== true) {
    return;
  }
  const elems = deepClone(idraw.getSelectedElements());
  elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
    idraw.deleteElement(elem.uuid);
  });
  idraw.getTempData().set('clipboardElements', elems);
}

export function deleteElements(idraw: iDraw) {
  if (idraw.getTempData().get('isFocus') !== true) {
    return;
  }
  const elems = deepClone(idraw.getSelectedElements());
  elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
    idraw.deleteElement(elem.uuid);
  });
}

const keyArrowMoveDistance = 4;

export function keyArrowUp(idraw: iDraw) {
  const elems = deepClone(idraw.getSelectedElements());
  if (elems.length > 0) {
    elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
      elem.y -= keyArrowMoveDistance;
      idraw.updateElement(elem);
    });
  } else {
    const { scrollTop } = idraw.getScreenTransform();
    idraw.scrollTop(scrollTop - keyArrowMoveDistance);
  }
}

export function keyArrowDown(idraw: iDraw) {
  const elems = deepClone(idraw.getSelectedElements());
  if (elems.length > 0) {
    elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
      elem.y += keyArrowMoveDistance;
      idraw.updateElement(elem);
    });
  } else {
    const { scrollTop } = idraw.getScreenTransform();
    idraw.scrollTop(scrollTop + keyArrowMoveDistance);
  }
}

export function keyArrowLeft(idraw: iDraw) {
  const elems = deepClone(idraw.getSelectedElements());
  if (elems.length > 0) {
    elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
      elem.x -= keyArrowMoveDistance;
      idraw.updateElement(elem);
    });
  } else {
    const { scrollLeft } = idraw.getScreenTransform();
    idraw.scrollLeft(scrollLeft - keyArrowMoveDistance);
  }
}

export function keyArrowRight(idraw: iDraw) {
  const elems = deepClone(idraw.getSelectedElements());
  if (elems.length > 0) {
    elems.forEach((elem: DataElement<keyof DataElemDesc>) => {
      elem.x += keyArrowMoveDistance;
      idraw.updateElement(elem);
    });
  } else {
    const { scrollLeft } = idraw.getScreenTransform();
    idraw.scrollLeft(scrollLeft + keyArrowMoveDistance);
  }
}

export function keyUndo(idraw: iDraw) {
  idraw.undo();
}
