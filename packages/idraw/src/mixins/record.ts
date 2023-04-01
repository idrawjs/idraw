import { IDrawData } from '@idraw/types';
import iDraw from './../index';

export function undo(idraw: iDraw): {
  doRecordCount: number;
  data: IDrawData | null;
} {
  const doRecords = idraw.getTempData().get('doRecords');
  const unDoRecords = idraw.getTempData().get('unDoRecords');
  if (!(doRecords.length > 1)) {
    return {
      doRecordCount: doRecords.length,
      data: null
    };
  }
  const popRecord = doRecords.pop();
  if (popRecord) {
    unDoRecords.push(popRecord);
  }
  const record = doRecords[doRecords.length - 1];
  if (record?.data) {
    idraw.setData(record.data);
  }
  idraw.getTempData().set('doRecords', doRecords);
  idraw.getTempData().set('unDoRecords', unDoRecords);
  return {
    doRecordCount: doRecords.length,
    data: record?.data || null
  };
}

export function redo(idraw: iDraw): {
  undoRecordCount: number;
  data: IDrawData | null;
} {
  const unDoRecords = idraw.getTempData().get('unDoRecords');
  if (!(unDoRecords.length > 0)) {
    return {
      undoRecordCount: unDoRecords.length,
      data: null
    };
  }
  const record = unDoRecords.pop();
  if (record?.data) {
    idraw.setData(record.data);
  }
  idraw.getTempData().set('unDoRecords', unDoRecords);
  return {
    undoRecordCount: unDoRecords.length,
    data: record?.data || null
  };
}
