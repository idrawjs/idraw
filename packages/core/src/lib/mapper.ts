import { TypePoint } from '@idraw/types';
import Board from '@idraw/board';

const _board = Symbol('_displayCtx');

export class Mapper {

  private [_board]: Board

  constructor(board: Board) {
    this[_board] = board;
  }

  isEffectivePoint(p: TypePoint): boolean {
    const scrollLineWidth = this[_board].getScrollLineWidth();
    const screenInfo = this[_board].getScreenInfo();
    if (p.x <= (screenInfo.width - scrollLineWidth) && p.y <= (screenInfo.height - scrollLineWidth)) {
      return true;
    }
    return false;
  }
}
