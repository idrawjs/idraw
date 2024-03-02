import type { UtilEventEmitter, CoreEventMap } from '@idraw/types';
import { limitAngle, loadImage, parseAngleToRadian } from '@idraw/util';
import { CURSOR, CURSOR_RESIZE, CURSOR_DRAG_DEFAULT, CURSOR_DRAG_ACTIVE, CURSOR_RESIZE_ROTATE } from './cursor-image';

export class Cursor {
  #eventHub: UtilEventEmitter<CoreEventMap>;
  #container: HTMLDivElement;
  #cursorType: 'default' | string | null = null;
  #resizeCursorBaseImage: HTMLImageElement | null = null;
  #cursorImageMap: Record<string, string> = {
    auto: CURSOR,
    'drag-default': CURSOR_DRAG_DEFAULT,
    'drag-active': CURSOR_DRAG_ACTIVE,
    'rotate-0': CURSOR_RESIZE,
    rotate: CURSOR_RESIZE_ROTATE
  };
  constructor(
    container: HTMLDivElement,
    opts: {
      eventHub: UtilEventEmitter<CoreEventMap>;
    }
  ) {
    this.#container = container;
    this.#eventHub = opts.eventHub;
    this.#init();
    this.#loadResizeCursorBaseImage();
  }

  #init() {
    const eventHub = this.#eventHub;
    this.#resetCursor('default');
    eventHub.on('cursor', (e) => {
      if (e.type === 'over-element' || !e.type) {
        this.#resetCursor('auto');
      } else if (e.type === 'resize-rotate') {
        this.#resetCursor('rotate');
      } else if (typeof e.type === 'string' && e.type?.startsWith('resize-')) {
        this.#setCursorResize(e);
      } else if (e.type === 'drag-default') {
        this.#resetCursor('drag-default');
      } else if (e.type === 'drag-active') {
        this.#resetCursor('drag-active');
      } else {
        this.#resetCursor('auto');
      }
    });
  }

  #loadResizeCursorBaseImage() {
    loadImage(CURSOR_RESIZE)
      .then((img) => {
        this.#resizeCursorBaseImage = img;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  #resetCursor(cursorKey: string) {
    if (this.#cursorType === cursorKey) {
      return;
    }
    this.#cursorType = cursorKey;
    const image = this.#cursorImageMap[this.#cursorType] || this.#cursorImageMap['auto'];
    let offsetX = 0;
    let offsetY = 0;
    if (cursorKey.startsWith('rotate-') && this.#cursorImageMap[this.#cursorType]) {
      offsetX = 10;
      offsetY = 10;
    } else if (cursorKey === 'rotate') {
      offsetX = 10;
      offsetY = 10;
    }
    if (cursorKey === 'default') {
      this.#container.style.cursor = 'default';
    } else {
      this.#container.style.cursor = `image-set(url(${image})2x) ${offsetX} ${offsetY}, auto`;
    }
  }

  #setCursorResize(e: CoreEventMap['cursor']) {
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
    const cursorKey = this.#appendRotateResizeImage(totalAngle);
    this.#resetCursor(cursorKey);
  }

  #appendRotateResizeImage(angle: number): string {
    const key = `rotate-${angle}`;
    if (!this.#cursorImageMap[key]) {
      const baseImage = this.#resizeCursorBaseImage;
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
        this.#cursorImageMap[key] = base;
      }
    }
    return key;
  }
}
