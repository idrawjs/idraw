import { IDrawData } from '@idraw/types';
import iDraw from './../index';
import { _tempData } from './../names';

export function undo(idraw: iDraw): {
  doRecordCount: number;
  data: IDrawData | null;
} {
  const doRecords = idraw[_tempData].get('doRecords');
  const unDoRecords = idraw[_tempData].get('unDoRecords');
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
  idraw[_tempData].set('doRecords', doRecords);
  idraw[_tempData].set('unDoRecords', unDoRecords);
  return {
    doRecordCount: doRecords.length,
    data: record?.data || null
  };
}

export function redo(idraw: iDraw): {
  undoRecordCount: number;
  data: IDrawData | null;
} {
  const unDoRecords = idraw[_tempData].get('unDoRecords');
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
  idraw[_tempData].set('unDoRecords', unDoRecords);
  return {
    undoRecordCount: unDoRecords.length,
    data: record?.data || null
  };
}
