import type { Data, ModifyType, ModifyContentMap, ModifyOptions, ModifyRecord } from '@idraw/types';
import { deepClone } from './data';
import { modifyElement } from './modify';

export interface ModifyRecorderOptions {
  recordable: boolean;
}

export class ModifyRecorder {
  #doStack: ModifyRecord[] = [];
  #undoStack: ModifyRecord[] = [];
  #opts: ModifyRecorderOptions;

  constructor(opts: ModifyRecorderOptions) {
    this.#opts = opts;
  }

  #wrapRecord<T extends ModifyType>(opts: ModifyOptions<T>, modifiedContent: ModifyContentMap[T]): ModifyRecord<T> {
    const content = opts.content as ModifyContentMap[T];
    const modifyRecord: ModifyRecord<T> = {
      ...deepClone<ModifyContentMap[T]>(content),
      // ...deepClone<ModifyContentMap[T]>(modifiedContent),
      type: opts.type,
      time: Date.now()
    } as ModifyRecord<T>;
    const record = modifyRecord as ModifyRecord<T>;
    if (opts.type === 'moveElement') {
      (modifyRecord as ModifyRecord<'moveElement'>).afterModifiedFrom = [...(modifiedContent as ModifyContentMap['moveElement']).from];
      (modifyRecord as ModifyRecord<'moveElement'>).afterModifiedTo = [...(modifiedContent as ModifyContentMap['moveElement']).to];
    }
    return record;
  }

  $getDoStack() {
    return this.#doStack;
  }

  $getUndoStack() {
    return this.#undoStack;
  }

  clear() {
    this.#doStack = [];
    this.#undoStack = [];
  }

  destroy() {
    this.clear();
    this.#doStack = null as any;
    this.#undoStack = null as any;
  }

  do<T extends ModifyType>(data: Data, opts: ModifyOptions<T>): Data {
    const { data: modifiedData, content } = modifyElement(data, opts);
    if (this.#opts.recordable === true) {
      const record = this.#wrapRecord(opts, content);
      this.#doStack.push(record);
    }
    return modifiedData;
  }

  undo(data: Data): Data | null {
    if (this.#opts.recordable !== true) {
      return null;
    }
    let modifiedData: Data | null = null;
    if (this.#doStack.length === 0) {
      return data;
    }
    const item = this.#doStack.pop();
    if (!item) {
      return data;
    }
    if (item?.type === 'addElement') {
      const record = item as ModifyRecord<'addElement'>;
      const { position, element } = record;
      modifiedData = modifyElement<'deleteElement'>(data, {
        type: 'deleteElement',
        content: {
          position,
          element
        }
      }).data;
    } else if (item?.type === 'updateElement') {
      const record = item as ModifyRecord<'updateElement'>;
      const { position, beforeModifiedElement, afterModifiedElement } = record;
      modifiedData = modifyElement<'updateElement'>(data, {
        type: 'updateElement',
        content: {
          position,
          beforeModifiedElement: afterModifiedElement,
          afterModifiedElement: beforeModifiedElement
        }
      }).data;
    } else if (item?.type === 'deleteElement') {
      const record = item as ModifyRecord<'deleteElement'>;
      const { position, element } = record;
      modifiedData = modifyElement<'addElement'>(data, {
        type: 'addElement',
        content: {
          position,
          element
        }
      }).data;
    } else if (item?.type === 'moveElement') {
      const record = item as ModifyRecord<'moveElement'>;
      const { afterModifiedFrom, afterModifiedTo } = record;
      const modifiedResult = modifyElement<'moveElement'>(data, {
        type: 'moveElement',
        content: {
          from: afterModifiedTo,
          to: afterModifiedFrom
        }
      });
      modifiedData = modifiedResult.data;
    }
    this.#undoStack.push(deepClone(item as ModifyRecord));
    return modifiedData;
  }

  redo(data: Data): Data | null {
    if (this.#opts.recordable !== true) {
      return null;
    }
    let modifiedData: Data | null = null;
    if (this.#undoStack.length === 0) {
      return modifiedData;
    }
    const item = this.#undoStack.pop();
    if (!item) {
      return modifiedData;
    }

    if (item?.type === 'addElement') {
      const record = item as ModifyRecord<'addElement'>;
      const { position, element } = record;
      modifiedData = modifyElement<'addElement'>(data, {
        type: 'addElement',
        content: {
          position,
          element
        }
      }).data;
    } else if (item?.type === 'updateElement') {
      const record = item as ModifyRecord<'updateElement'>;
      const { position, beforeModifiedElement, afterModifiedElement } = record;
      modifiedData = modifyElement<'updateElement'>(data, {
        type: 'updateElement',
        content: {
          position,
          beforeModifiedElement,
          afterModifiedElement
        }
      }).data;
    } else if (item?.type === 'deleteElement') {
      const record = item as ModifyRecord<'deleteElement'>;
      const { position, element } = record;
      modifiedData = modifyElement<'deleteElement'>(data, {
        type: 'deleteElement',
        content: {
          position,
          element
        }
      }).data;
    } else if (item?.type === 'moveElement') {
      const record = item as ModifyRecord<'moveElement'>;
      const { from, to } = record;
      modifiedData = modifyElement<'moveElement'>(data, {
        type: 'moveElement',
        content: {
          from,
          to
        }
      }).data;
    }
    this.#doStack.push(deepClone(item as ModifyRecord));
    return modifiedData;
  }
}
