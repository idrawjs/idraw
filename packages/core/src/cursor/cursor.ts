import type { UtilEventEmitter, CoreEventMap } from '@idraw/types';
import {
  limitAngle,
  loadImage,
  parseAngleToRadian,
  createId,
  addClassName,
  removeClassName,
  injectStyles,
} from '@idraw/util';
import {
  CURSOR,
  CURSOR_RESIZE,
  CURSOR_DRAG_DEFAULT,
  CURSOR_DRAG_ACTIVE,
  CURSOR_RESIZE_ROTATE,
  CURSOR_PEN,
  CURSOR_PLUS,
} from './cursor-image';
import { coreEventKeys } from '../static';

const key = `idraw-core-cursor`;
const ID = `${key}-${createId()}`;

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
    rotate: CURSOR_RESIZE_ROTATE,
    pen: CURSOR_PEN,
    plus: CURSOR_PLUS,
  };
  #classNameMap: Record<string, string> = {};

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
    Object.keys(this.#cursorImageMap).forEach((cursorKey: string) => {
      const className = `${ID}-${cursorKey}`;
      this.#classNameMap[cursorKey] = className;
      const image = this.#cursorImageMap[cursorKey];
      this.#injectCursorStyle(cursorKey, className, image);
    });
  }

  #injectCursorStyle(cursorKey: string, className: string, image: string) {
    const { offsetX, offsetY } = this.#getCursorOffset(cursorKey);
    injectStyles({
      rootClassName: className,
      type: 'element',
      styles: {
        cursor: `image-set(url(${image})2x) ${offsetX} ${offsetY}, auto`,
      },
    });
  }

  #init() {
    const eventHub = this.#eventHub;
    this.#resetCursor('default');
    eventHub.on(coreEventKeys.CURSOR, (e) => {
      if (e.type === 'over-material' || !e.type) {
        this.#resetCursor('auto');
      } else if (e.type === 'resize-rotate') {
        this.#resetCursor('rotate');
      } else if (typeof e.type === 'string' && e.type?.startsWith('resize-')) {
        this.#setCursorResize(e);
      } else if (e.type === 'drag-default') {
        this.#resetCursor('drag-default');
      } else if (e.type === 'drag-active') {
        this.#resetCursor('drag-active');
      } else if (e.type === 'pen') {
        this.#resetCursor('pen');
      } else if (e.type === 'plus') {
        this.#resetCursor('plus');
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
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }

  #getCursorOffset(cursorKey: string) {
    let offsetX = 0;
    let offsetY = 0;
    if (cursorKey.startsWith('rotate-') && this.#cursorImageMap[cursorKey]) {
      offsetX = 10;
      offsetY = 10;
    } else if (cursorKey === 'rotate') {
      offsetX = 10;
      offsetY = 10;
    } else if (cursorKey === 'plus') {
      offsetX = 5;
      offsetY = 3;
    }
    return {
      offsetX,
      offsetY,
    };
  }

  #resetCursor(cursorKey: string) {
    if (this.#cursorType === cursorKey) {
      return;
    }
    this.#cursorType = cursorKey;

    const container = this.#container;
    const currentClassName = this.#classNameMap[cursorKey] || this.#classNameMap['auto'];
    const allClassNames: string[] = Object.keys(this.#classNameMap).map((name) => this.#classNameMap[name]);
    removeClassName(container, allClassNames);
    addClassName(container, [currentClassName]);
  }

  #setCursorResize(e: CoreEventMap[typeof coreEventKeys.CURSOR]) {
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
    totalAngle += limitAngle(e?.material?.angle || 0);
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
    const cursorKey = `rotate-${angle}`;
    if (!this.#cursorImageMap[cursorKey]) {
      const baseImage = this.#resizeCursorBaseImage;
      if (baseImage) {
        const canvas = document.createElement('canvas');
        const w = baseImage.width;
        const h = baseImage.height;
        const center = {
          x: w / 2,
          y: h / 2,
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
        this.#cursorImageMap[cursorKey] = base;

        const className = `${ID}-${cursorKey}`;
        this.#classNameMap[cursorKey] = className;
        this.#injectCursorStyle(cursorKey, className, base);
      }
    }
    return cursorKey;
  }
}
