import type { UtilEventEmitter, CoreEvent } from '@idraw/types';
import { limitAngle, loadImage, parseAngleToRadian } from '@idraw/util';
import { CURSOR, CURSOR_RESIZE } from './cursor-image';

export class Cursor {
  private _eventHub: UtilEventEmitter<CoreEvent>;
  private _container: HTMLDivElement;
  private _cursorType: 'auto' | string | null = null;
  private _resizeCursorBaseImage: HTMLImageElement | null = null;
  private _cursorImageMap: Record<string, string> = {
    auto: CURSOR,
    'rotate-0': CURSOR_RESIZE
  };
  constructor(
    container: HTMLDivElement,
    opts: {
      eventHub: UtilEventEmitter<CoreEvent>;
    }
  ) {
    this._container = container;
    this._eventHub = opts.eventHub;
    this._init();
    this._loadResizeCursorBaseImage();
  }

  private _init() {
    const { _eventHub: eventHub } = this;
    this._resetCursor('auto');
    eventHub.on('cursor', (e) => {
      if (e.type === 'over-element' || !e.type) {
        this._resetCursor('auto');
      } else if (typeof e.type === 'string' && e.type?.startsWith('resize-')) {
        this._setCursorResize(e);
      } else {
        // TODO
        this._resetCursor('auto');
      }
    });
  }

  private _loadResizeCursorBaseImage() {
    loadImage(CURSOR_RESIZE)
      .then((img) => {
        this._resizeCursorBaseImage = img;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private _resetCursor(cursorKey: string) {
    if (this._cursorType === cursorKey) {
      return;
    }
    this._cursorType = cursorKey;
    const image = this._cursorImageMap[this._cursorType] || this._cursorImageMap['auto'];
    let offsetX = 0;
    let offsetY = 0;
    if (cursorKey.startsWith('rotate-') && this._cursorImageMap[this._cursorType]) {
      offsetX = 10;
      offsetY = 10;
    }
    this._container.style.cursor = `image-set(url(${image})2x) ${offsetX} ${offsetY}, auto`;
  }

  private _setCursorResize(e: CoreEvent['cursor']) {
    let totalAngle = 0;
    if (e.type === 'resize-top') {
      totalAngle += 0;
    } else if (e.type === 'resize-top-right') {
      totalAngle += 45;
    } else if (e.type === 'resize-right') {
      totalAngle += 90;
    } else if (e.type === 'resize-bottom-right') {
      totalAngle += 135;
    } else if (e.type === 'resize-bottom') {
      totalAngle += 180;
    } else if (e.type === 'resize-bottom-left') {
      totalAngle += 225;
    } else if (e.type === 'resize-left') {
      totalAngle += 270;
    } else if (e.type === 'resize-top-left') {
      totalAngle += 315;
    }
    totalAngle += limitAngle(e?.element?.angle || 0);
    if (Array.isArray(e.groupQueue) && e.groupQueue.length > 0) {
      e.groupQueue.forEach((group) => {
        totalAngle += limitAngle(group.angle || 0);
      });
    }
    totalAngle = limitAngle(totalAngle);
    const cursorKey = this._appendRotateResizeImage(totalAngle);
    this._resetCursor(cursorKey);
  }

  private _appendRotateResizeImage(angle: number): string {
    const key = `rotate-${angle}`;
    if (!this._cursorImageMap[key]) {
      const baseImage = this._resizeCursorBaseImage;
      if (baseImage) {
        const canvas = document.createElement('canvas');
        const w = baseImage.width;
        const h = baseImage.height;
        const center = {
          x: w / 2,
          y: h / 2
        };
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const radian = parseAngleToRadian(angle);

        ctx.translate(center.x, center.y);
        ctx.rotate(radian);
        ctx.translate(-center.x, -center.y);

        ctx.drawImage(baseImage, 0, 0, w, h);

        ctx.translate(center.x, center.y);
        ctx.rotate(-radian);
        ctx.translate(-center.x, -center.y);

        const base = canvas.toDataURL('image/png');
        this._cursorImageMap[key] = base;
      }
    }
    return key;
  }
}
