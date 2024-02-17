import { Data, Element, ModifyOptions, ModifyType, ModifyContentMap, ModifiedElement } from '@idraw/types';
import { insertElementToListByPosition, deleteElementInListByPosition, moveElementPosition, updateElementInListByPosition } from './handle-element';
import { istype } from './istype';

export function modifyElement<T extends ModifyType = ModifyType>(data: Data, options: ModifyOptions<T>): { data: Data; content: ModifyContentMap[T] } {
  const { type } = options;
  const content: ModifyContentMap[T] = { ...options.content } as ModifyContentMap[T];
  if (type === 'addElement') {
    const opts: ModifyOptions<'addElement'> = options as ModifyOptions<'addElement'>;
    const { element, position } = opts.content;
    if (position?.length > 0) {
      insertElementToListByPosition(element, [...position], data.elements);
    } else {
      data.elements.push(element);
    }
  } else if (type === 'deleteElement') {
    const opts: ModifyOptions<'deleteElement'> = options as ModifyOptions<'deleteElement'>;
    const { position } = opts.content;
    deleteElementInListByPosition(position, data.elements);
  } else if (type === 'moveElement') {
    const opts: ModifyOptions<'moveElement'> = options as ModifyOptions<'moveElement'>;
    const { from, to } = opts.content;
    const movedResult = moveElementPosition(data.elements, { from, to });
    (content as ModifyContentMap['moveElement']).from = movedResult.from;
    (content as ModifyContentMap['moveElement']).to = movedResult.to;
    data.elements = movedResult.elements;
  } else if (type === 'updateElement') {
    const opts: ModifyOptions<'updateElement'> = options as ModifyOptions<'updateElement'>;
    const { position, afterModifiedElement } = opts.content;
    updateElementInListByPosition(position, afterModifiedElement, data.elements);
  }
  return { data, content };
}

function _get(source: any, path: string, defaultValue = undefined) {
  // a.0.b -> ['a', '0', 'b']
  const keyList = path.split('.');
  const result = keyList.reduce((obj, key) => {
    return Object(obj)[key];
  }, source);
  return result === undefined ? defaultValue : result;
}

function _set(obj: any, path: string, value: any) {
  // a.0.b -> ['a', '0', 'b']
  const keys = path.split('.');

  if (typeof obj !== 'object') return obj;
  keys.reduce((o, k, i, _) => {
    if (i === _.length - 1) {
      o[k] = value;
      return null;
    } else if (k in o) {
      return o[k];
    } else {
      o[k] = /^[0-9]{1,}$/.test(_[i + 1]) ? [] : {};
      return o[k];
    }
  }, obj);
  return obj;
}

export function getModifiedElement(target: ModifiedElement, originElement: Element): ModifiedElement {
  const modifiedElement: ModifiedElement = {};
  const pathList: Array<number | string> = [];
  const _walk = (t: any) => {
    if (istype.json(t)) {
      const keys = Object.keys(t);
      keys.forEach((key: string) => {
        pathList.push(key);
        if (istype.json(t[key]) || istype.array(t[key])) {
          _walk(t[key]);
        } else {
          const pathStr = pathList.join('.');
          if (pathStr !== 'uuid') {
            const value = _get(originElement, pathStr);
            _set(modifiedElement, pathList.join('.'), value);
          }
        }
        pathList.pop();
      });
    } else if (istype.array(t)) {
      t.forEach((index: number) => {
        pathList.push(index);
        if (istype.json(t[index]) || istype.array(t[index])) {
          _walk(t[index]);
        } else {
          const value = _get(originElement, pathList.join('.'));
          _set(modifiedElement, pathList.join('.'), value);
        }
        pathList.pop();
      });
    }
  };
  _walk(target);

  return modifiedElement;
}
