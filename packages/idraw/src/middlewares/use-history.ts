import type {
  Middleware,
  ModifyRecord,
  Material,
  DataLayout,
  RecursivePartial,
  DataGlobal,
  HistoryHandler,
} from '@idraw/types';
import { unflatObject, calcResultMovePosition } from '@idraw/util';
import { Core } from '@idraw/core';
import type { IDrawEvent } from '../event';
import { eventKeys } from '../event';

const supportRecordTypes = [
  'updateMaterial',
  'modifyMaterial',
  'deleteMaterial',
  'moveMaterial',
  'addMaterial',
  'resizeMaterial',
  'resizeMaterials',
  'resizeLayout',
  'modifyLayout',
  'modifyGlobal',
];

const LIMIT = 100;

export const useHistory = (opts: { core: Core; limit?: number }) => {
  const { core, limit } = opts;
  const historyLimit = limit && limit > 0 ? limit : LIMIT;

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
      if (record.content.method === 'modifyMaterial') {
        const info = unflatObject(record.content.before || {});
        undoRecord = core.modifyMaterial({
          ...info,
          id: (record as ModifyRecord<'modifyMaterial'>).content?.id,
        }) as ModifyRecord;
      } else if (record.content.method === 'updateMaterial') {
        const info = unflatObject(record.content.before || {}) as Material;
        undoRecord = core.updateMaterial({ ...info, id: record.content.id }) as ModifyRecord;
      } else if (record.content.method === 'addMaterial') {
        const id = record.content.id;
        undoRecord = core.deleteMaterial(id) as ModifyRecord;
      } else if (record.content.method === 'deleteMaterial') {
        const { material, position } = record.content;
        if (!material) {
          return;
        }
        if (!material) {
          return;
        }
        undoRecord = core.addMaterial(material, { position }) as ModifyRecord;
      } else if (record.content.method === 'moveMaterial') {
        const id = record.content.id;
        const moveResult = calcResultMovePosition({
          from: record.content.from,
          to: record.content.to,
        });
        if (!moveResult) {
          return;
        }
        undoRecord = core.moveMaterial(id, moveResult.from) as ModifyRecord;
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
      } else if (record.content.method === 'modifyMaterials') {
        undoRecord = core.modifyMaterials(
          record.content.before.map((item) => unflatObject(item)) as unknown as Array<
            RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>
          >
        ) as ModifyRecord;
      }

      undoRecord = { ...undoRecord, type: 'undo' } as ModifyRecord<'undo'>;
      undoRecords.push(undoRecord);
      if (undoRecords.length > historyLimit) {
        undoRecords.splice(historyLimit - undoRecords.length, undoRecords.length);
      }
    }
  };

  const redoAction = () => {
    if (undoRecords?.length > 0) {
      const record = undoRecords.pop();
      if (!record) {
        return;
      }
      let redoRecord: ModifyRecord = { ...record };
      if (record.content.method === 'modifyMaterial') {
        const info = unflatObject(record.content.before || {});
        redoRecord = core.modifyMaterial({
          ...info,
          id: (record as ModifyRecord<'modifyMaterial'>).content.id,
        }) as ModifyRecord;
      } else if (record.content.method === 'updateMaterial') {
        const info = unflatObject(record.content.before || {}) as Material;
        redoRecord = core.updateMaterial({ ...info, id: record.content.id }) as ModifyRecord;
      } else if (record.content.method === 'addMaterial') {
        const id = record.content.id;
        redoRecord = core.deleteMaterial(id) as ModifyRecord;
      } else if (record.content.method === 'deleteMaterial') {
        const { material, position } = record.content;
        if (!material) {
          return;
        }
        redoRecord = core.addMaterial(material, { position }) as ModifyRecord;
      } else if (record.content.method === 'moveMaterial') {
        const id = record.content.id;
        const moveResult = calcResultMovePosition({
          from: record.content.from,
          to: record.content.to,
        });
        if (!moveResult) {
          return;
        }
        redoRecord = core.moveMaterial(id, moveResult.from) as ModifyRecord;
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
      } else if (record.content.method === 'modifyMaterials') {
        redoRecord = core.modifyMaterials(
          record.content.before.map((item) => unflatObject(item)) as unknown as Array<
            RecursivePartial<Omit<Material, 'id'>> & Pick<Material, 'id'>
          >
        ) as ModifyRecord;
      }
      redoRecord = { ...redoRecord, type: 'redo' } as ModifyRecord<'redo'>;
      doRecords.push(redoRecord);
      if (doRecords.length > historyLimit) {
        doRecords.splice(historyLimit - doRecords.length, doRecords.length);
      }
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
      },
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
    doRecords = [];
    while (undoRecords?.length > 0) {
      undoRecords.pop();
    }
    undoRecords = [];
  };

  const getDoRecords = () => doRecords;
  const getUndoRecords = () => undoRecords;

  const historyHandler: HistoryHandler = {
    undo: undoAction,
    redo: redoAction,
    destroy,
    clear,
    canUndo: () => doRecords.length > 0,
    canRedo: () => undoRecords.length > 0,
    __getDoRecords: getDoRecords,
    __getUndoRecords: getUndoRecords,
  };

  return {
    MiddlewareHistory,
    historyHandler,
  } as const;
};
