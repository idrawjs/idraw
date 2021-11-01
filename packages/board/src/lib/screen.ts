import {
  TypeBoardSizeOptions, TypeScreenPosition,
  TypeContext, TypeScreenSize,
} from '@idraw/types';

type Options = {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
  devicePixelRatio: number;
}


const _opts = Symbol('_opts');
const _ctx = Symbol('_ctx');

export class Screen {
  private [_opts]: Options;
  private [_ctx]: TypeContext;
  
  constructor(ctx: TypeContext, opts: Options) {
    this[_opts] = opts;
    this[_ctx] = ctx;
  }

  resetSize(opts: TypeBoardSizeOptions) {
    this[_opts] = {...this[_opts], ...opts};
  }

  calcScreen(): {
    size: TypeScreenSize, position: TypeScreenPosition, deviceSize: TypeScreenSize,
    width: number, height: number, devicePixelRatio: number,
    canScrollXPrev: boolean,
    canScrollXNext: boolean,
    canScrollYPrev: boolean,
    canScrollYNext: boolean,
  } {
    const scaleRatio = this[_ctx].getTransform().scale;
    const { 
      width, height, contextWidth, contextHeight,
      devicePixelRatio: pxRatio,
    } = this[_opts];

    let canScrollXPrev: boolean = true;
    let canScrollXNext: boolean = true;
    let canScrollYPrev: boolean = true;
    let canScrollYNext: boolean = true;

    // init scroll
    if (contextWidth * scaleRatio <= width) {
      // make context center
      this[_ctx].setTransform({
        scrollX: (width - contextWidth * scaleRatio) / 2,
      });
      canScrollXPrev = false;
      canScrollXNext = false;
    }

    if (contextHeight * scaleRatio <= height) {
      // make context center
      this[_ctx].setTransform({
        scrollY: (height - contextHeight * scaleRatio) / 2,
      });
      canScrollYPrev = false;
      canScrollYNext = false;
    }

    if (contextWidth * scaleRatio >= width && this[_ctx].getTransform().scrollX > 0) {
      this[_ctx].setTransform({
        scrollX: 0,
      });
      canScrollXPrev = false;
    }
    if (contextHeight * scaleRatio >= height && this[_ctx].getTransform().scrollY > 0) {
      this[_ctx].setTransform({
        scrollY: 0,
      });
      canScrollYPrev = false;
    }

    const { scrollX: _scrollX, scrollY: _scrollY } = this[_ctx].getTransform();

    // reset scroll
    if (_scrollX < 0 && Math.abs(_scrollX) > Math.abs(contextWidth * scaleRatio - width)) {
      this[_ctx].setTransform({
        scrollX: 0 - Math.abs(contextWidth * scaleRatio - width)
      });
      canScrollXNext = false;
    }
    if (_scrollY < 0 && Math.abs(_scrollY) > Math.abs(contextHeight * scaleRatio - height)) {
      this[_ctx].setTransform({
        scrollY: 0 - Math.abs(contextHeight * scaleRatio - height)
      });
      canScrollYNext = false;
    }

    // result size
    const { scrollX, scrollY } = this[_ctx].getTransform();
    const size = {
      x: scrollX * scaleRatio,
      y: scrollY * scaleRatio,
      w: contextWidth * scaleRatio,
      h: contextHeight * scaleRatio,
    };
    const deviceSize = {
      x: scrollX * pxRatio,
      y: scrollY * pxRatio,
      w: contextWidth * pxRatio * scaleRatio,
      h: contextHeight * pxRatio * scaleRatio,
    };
    const position = {
      top: scrollY,
      bottom: height - (contextHeight * scaleRatio + scrollY),
      left: scrollX,
      right: width - (contextWidth * scaleRatio + scrollX),
    };

    return {
      size,
      position,
      deviceSize,
      width: this[_opts].width,
      height: this[_opts].height,
      devicePixelRatio: this[_opts].devicePixelRatio,
      canScrollYPrev,
      canScrollYNext,
      canScrollXPrev,
      canScrollXNext,
    };
  }

  calcScreenScroll( start: number, end: number, sliderSize: number, limitLen: number, moveDistance: number
  ): number {
    let scrollDistance = start;
    let scrollLen = limitLen - sliderSize;
    if (start <= 0 && end <= 0) {
      scrollLen = Math.abs(start) + Math.abs(end);
    }
    let unit = 1;
    if (scrollLen > 0) {
      unit = scrollLen / (limitLen - sliderSize);
    }
    scrollDistance = 0 - unit * moveDistance; 
    return scrollDistance;
  }

}