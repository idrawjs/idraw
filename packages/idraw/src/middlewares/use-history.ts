import type {
  Middleware,
  ModifyRecord,
  Element,
  DataLayout,
  RecursivePartial,
  DataGlobal,
  IDrawHistory
} from '@idraw/types';
import { unflatObject, calcResultMovePosition } from '@idraw/util';
import type { IDrawEvent } from '../event';
import { eventKeys } from '../event';
import type { iDraw } from '../idraw';

const supportRecordTypes = [
  'updateElement',
  'modifyElement',
  'deleteElement',
  'moveElement',
  'addElement',
  'dragElement',
  'resizeElement',
  'dragLayout',
  'modifyLayout',
  'modifyGlobal'
];

export const useHistory = (opts: { instance: iDraw }) => {
  const { instance } = opts;
  const core = instance.getCore();
  let doRecords: ModifyRecord[] = [];
  let undoRecords: ModifyRecord[] = [];

  const doAction = (record: ModifyRecord) => {
    doRecords.push(record);
  };

  const undoAction = () => {
    if (doRecords?.length > 0) {
      const record = doRecords.pop();
      if (!record) {
        return;
      }
      let undoRecord: ModifyRecord = { ...record };
      if (record.content.method === 'modifyElement') {
        const info = unflatObject(record.content.before || {});
        undoRecord = core.modifyElement({
          ...info,
          uuid: (record as ModifyRecord<'modifyElement'>).content?.uuid
        }) as ModifyRecord;
      } else if (record.content.method === 'updateElement') {
        const info = unflatObject(record.content.before || {}) as Element;
        undoRecord = core.updateElement({ ...info, uuid: record.content.uuid }) as ModifyRecord;
      } else if (record.content.method === 'addElement') {
        const uuid = record.content.uuid;
        undoRecord = core.deleteElement(uuid) as ModifyRecord;
      } else if (record.content.method === 'deleteElement') {
        const { element, position } = record.content;
        if (!element) {
          return;
        }
        if (!element) {
          return;
        }
        undoRecord = core.addElement(element, { position }) as ModifyRecord;
      } else if (record.content.method === 'moveElement') {
        const uuid = record.content.uuid;
        const moveResult = calcResultMovePosition({
          from: record.content.from,
          to: record.content.to
        });
        if (!moveResult) {
          return;
        }
        undoRecord = core.moveElement(uuid, moveResult.from) as ModifyRecord;
      } else if (record.content.method === 'modifyLayout') {
        const info =
          record.content.before === null
            ? null
            : (unflatObject(record.content.before || {}) as RecursivePartial<DataLayout>);
        undoRecord = core.modifyLayout(info) as ModifyRecord;
      } else if (record.content.method === 'modifyGlobal') {
        const info =
          record.content.before === null
            ? null
            : (unflatObject(record.content.before || {}) as RecursivePartial<DataGlobal>);
        undoRecord = core.modifyGlobal(info) as ModifyRecord;
      } else if (record.content.method === 'modifyElements') {
        undoRecord = core.modifyElements(
          record.content.before.forEach((item) => unflatObject(item)) as unknown as Array<
            RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>
          >
        ) as ModifyRecord;
      }

      undoRecord = { ...undoRecord, type: 'undo' } as ModifyRecord<'undo'>;
      undoRecords.push(undoRecord);
    }
  };

  const redoAction = () => {
    if (undoRecords?.length > 0) {
      const record = undoRecords.pop();
      if (!record) {
        return;
      }
      let redoRecord: ModifyRecord = { ...record };
      if (record.content.method === 'modifyElement') {
        const info = unflatObject(record.content.before || {});
        redoRecord = core.modifyElement({
          ...info,
          uuid: (record as ModifyRecord<'modifyElement'>).content.uuid
        }) as ModifyRecord;
      } else if (record.content.method === 'updateElement') {
        const info = unflatObject(record.content.before || {}) as Element;
        redoRecord = core.updateElement({ ...info, uuid: record.content.uuid }) as ModifyRecord;
      } else if (record.content.method === 'addElement') {
        const uuid = record.content.uuid;
        redoRecord = core.deleteElement(uuid) as ModifyRecord;
      } else if (record.content.method === 'deleteElement') {
        const { element, position } = record.content;
        if (!element) {
          return;
        }
        redoRecord = core.addElement(element, { position }) as ModifyRecord;
      } else if (record.content.method === 'moveElement') {
        const uuid = record.content.uuid;
        const moveResult = calcResultMovePosition({
          from: record.content.from,
          to: record.content.to
        });
        if (!moveResult) {
          return;
        }
        redoRecord = core.moveElement(uuid, moveResult.from) as ModifyRecord;
      } else if (record.content.method === 'modifyLayout') {
        const info =
          record.content.before === null
            ? null
            : (unflatObject(record.content.before || {}) as RecursivePartial<DataLayout>);
        redoRecord = core.modifyLayout(info) as ModifyRecord;
      } else if (record.content.method === 'modifyGlobal') {
        const info =
          record.content.before === null
            ? null
            : (unflatObject(record.content.before || {}) as RecursivePartial<DataGlobal>);
        redoRecord = core.modifyGlobal(info) as ModifyRecord;
      } else if (record.content.method === 'modifyElements') {
        redoRecord = core.modifyElements(
          record.content.before.forEach((item) => unflatObject(item)) as unknown as Array<
            RecursivePartial<Omit<Element, 'uuid'>> & Pick<Element, 'uuid'>
          >
        ) as ModifyRecord;
      }
      redoRecord = { ...redoRecord, type: 'redo' } as ModifyRecord<'redo'>;
      doRecords.push(redoRecord);
    }
  };

  const MiddlewareHistory: Middleware<any, IDrawEvent> = (opts) => {
    const { eventHub } = opts;
    const changeEvent = (e: IDrawEvent['change']) => {
      const { modifyRecord } = e;
      if (modifyRecord && supportRecordTypes.includes(modifyRecord?.type)) {
        doAction(modifyRecord);
      }
    };

    const onEvents = () => {
      eventHub.on(eventKeys.CHANGE, changeEvent);
    };

    const offEvents = () => {
      eventHub.off(eventKeys.CHANGE, changeEvent);
    };

    return {
      name: '@middleware/history',
      use() {
        onEvents();
      },
      disuse() {
        offEvents();
      }
    };
  };

  const destroy = () => {
    clear();
    doRecords = null as any;
    undoRecords = null as any;
  };

  const clear = () => {
    while (doRecords?.length > 0) {
      doRecords.pop();
    }
    while (undoRecords?.length > 0) {
      undoRecords.pop();
    }
  };

  const getDoRecords = () => doRecords;
  const getUndoRecords = () => undoRecords;

  const history: IDrawHistory = {
    undo: undoAction,
    redo: redoAction,
    destroy,
    clear,
    canUndo: () => doRecords.length > 0,
    canRedo: () => undoRecords.length > 0,
    __getDoRecords: getDoRecords,
    __getUndoRecords: getUndoRecords
  };

  return {
    MiddlewareHistory,
    history
  } as const;
};
