import type {
  Point,
  Material,
  MaterialSize,
  RendererDrawMaterialOptions,
  ViewContext2D,
  VirtualRectAttributes,
  DefaultMaterialAttributes,
  ViewScaleInfo,
  ViewSizeInfo,
  ViewCalculator,
} from '@idraw/types';
import {
  scalePathCommands,
  shiftPathCommands,
  convertPathCommandsToStr,
  getDefaultMaterialAttributes,
  omit,
  calcViewPoint,
  calcViewMaterialSize,
  rotateByCenter,
  is,
} from '@idraw/util';
import { createColor } from './color';

let defaultAttrs: DefaultMaterialAttributes = getDefaultMaterialAttributes();
defaultAttrs = omit(defaultAttrs, ['fill']) as DefaultMaterialAttributes;

export function drawBase(ctx: ViewContext2D, mtrl: Material, opts: RendererDrawMaterialOptions) {
  const { viewScaleInfo, viewSizeInfo, calculator } = opts;
  const {
    opacity,
    fill,
    fillOpacity,
    fillRule,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeLinecap,
    strokeLinejoin,
    strokeDasharray,
    strokeDashoffset,
    strokeMiterlimit,
  } = { ...defaultAttrs, ...mtrl };
  const { scale, offsetLeft, offsetTop } = viewScaleInfo;
  const { devicePixelRatio } = viewSizeInfo;
  const virtualAttributes = calculator.getVirtualItem(mtrl.id) as VirtualRectAttributes;
  const { commands, worldCenter } = virtualAttributes;
  const { width, height } = mtrl;

  let cmds = commands;
  cmds = scalePathCommands(cmds, scale, scale);
  cmds = shiftPathCommands(
    cmds,
    (offsetLeft + (worldCenter.x - width / 2) * scale) * devicePixelRatio,
    (offsetTop + (worldCenter.y - height / 2) * scale) * devicePixelRatio
  );

  const originGlobalAlpha = ctx.globalAlpha;

  // next version
  const pathStr = convertPathCommandsToStr(cmds);
  const path2d = new Path2D(pathStr);

  // shadow
  drawShadow(ctx, mtrl, { ...opts, path2d });

  // clip (overflow=hidden)
  drawClipPath(ctx, mtrl, {
    path2d,
    viewScaleInfo,
    viewSizeInfo,
    calculator,
    renderContent: () => {
      // fill
      if (fill) {
        const viewMaterialSize = calcViewMaterialSize(mtrl, { viewScaleInfo });
        if (typeof fillOpacity === 'number' && fillOpacity > 0) {
          ctx.globalAlpha = originGlobalAlpha * fillOpacity * opacity;
        }
        ctx.fillStyle = createColor(ctx, fill, { viewMaterialSize, viewScaleInfo, opacity: mtrl.opacity || 1 });
        ctx.fill(path2d, fillRule);
        ctx.globalAlpha = originGlobalAlpha;
      }

      // stroke
      if (typeof strokeWidth === 'number' && strokeWidth > 0) {
        if (typeof strokeOpacity === 'number' && strokeOpacity > 0) {
          ctx.globalAlpha = originGlobalAlpha * strokeOpacity * opacity;
        }

        ctx.lineCap = strokeLinecap;
        ctx.lineJoin = strokeLinejoin;
        ctx.lineDashOffset = strokeDashoffset;
        ctx.miterLimit = strokeMiterlimit;

        if (Array.isArray(strokeDasharray)) {
          const lineDash = strokeDasharray.map((dash) => scale * dash);
          ctx.setLineDash(lineDash);
        }
        ctx.lineWidth = strokeWidth * scale;
        ctx.strokeStyle = stroke as string; // TODO
        ctx.stroke(path2d);
        ctx.setLineDash([]);

        // reset
        ctx.lineCap = defaultAttrs.strokeLinecap;
        ctx.lineJoin = defaultAttrs.strokeLinejoin;
        ctx.lineDashOffset = defaultAttrs.strokeDashoffset;
        ctx.miterLimit = defaultAttrs.strokeMiterlimit;
        ctx.globalAlpha = originGlobalAlpha;
      }
    },
  });
}

export function drawShadow(
  ctx: ViewContext2D,
  viewMtrl: Material,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; tempContext: ViewContext2D; path2d: Path2D }
): void {
  const { ...detail } = viewMtrl;
  const { viewScaleInfo, viewSizeInfo, tempContext, path2d } = opts;
  const { width, height } = viewSizeInfo;
  const { shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur } = detail;
  if (is.number(shadowBlur) && shadowColor) {
    tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

    tempContext.save();
    tempContext.shadowColor = shadowColor;
    tempContext.shadowOffsetX = (shadowOffsetX || 0) * viewScaleInfo.scale;
    tempContext.shadowOffsetY = (shadowOffsetY || 0) * viewScaleInfo.scale;
    tempContext.shadowBlur = (shadowBlur || 0) * viewScaleInfo.scale;
    tempContext.fillStyle = '#ffffff';
    tempContext.fill(path2d);
    tempContext.restore();

    tempContext.save();
    tempContext.globalCompositeOperation = 'destination-out';
    tempContext.fillStyle = '#ffffff';
    tempContext.fill(path2d);
    tempContext.restore();

    ctx.drawImage(tempContext.canvas, 0, 0, width, height);
    tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
  }
}

export function drawClipPath(
  ctx: ViewContext2D,
  mtrl: Material,
  opts: {
    path2d?: Path2D;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    renderContent?: () => void;
    calculator: ViewCalculator;
  }
) {
  const { renderContent, calculator, viewScaleInfo, viewSizeInfo } = opts;
  if (mtrl.overflow === 'hidden') {
    let path2d: Path2D | undefined = opts.path2d;
    if (!path2d) {
      const { scale, offsetLeft, offsetTop } = viewScaleInfo;
      const { devicePixelRatio } = viewSizeInfo;
      const virtualAttributes = calculator.getVirtualItem(mtrl.id) as VirtualRectAttributes;
      const { commands, worldCenter } = virtualAttributes;

      const { width, height } = mtrl;

      let cmds = commands;
      cmds = scalePathCommands(cmds, scale, scale);
      cmds = shiftPathCommands(
        cmds,
        (offsetLeft + (worldCenter.x - width / 2) * scale) * devicePixelRatio,
        (offsetTop + (worldCenter.y - height / 2) * scale) * devicePixelRatio
      );
      const pathStr = convertPathCommandsToStr(cmds);
      path2d = new Path2D(pathStr);
    }

    ctx.save();
    ctx.clip(path2d, 'nonzero');

    // rotateElement(ctx, { ...viewElem }, () => {
    //   renderContent?.();
    // });
    renderContent?.();

    ctx.restore();
  } else {
    renderContent?.();
  }
}

export function rotateViewMaterial(
  ctx: ViewContext2D,
  mtrl: Material,
  opts: RendererDrawMaterialOptions,
  callback: (e: { viewWorldCenter: Point; viewWorldSize: MaterialSize }) => void
) {
  const { viewScaleInfo, calculator } = opts;
  const virtualAttributes = calculator?.getVirtualItem(mtrl.id) as VirtualRectAttributes;
  if (virtualAttributes) {
    const { worldAngle, worldCenter } = virtualAttributes;
    const viewWorldCenter = calcViewPoint(worldCenter, { viewScaleInfo });
    const { scale } = viewScaleInfo;

    rotateByCenter(ctx, worldAngle, viewWorldCenter, () => {
      const width = mtrl.width * scale;
      const height = mtrl.height * scale;
      const viewWorldSize: MaterialSize = {
        x: viewWorldCenter.x - width / 2,
        y: viewWorldCenter.y - height / 2,
        width,
        height,
      };
      callback({ viewWorldCenter, viewWorldSize });
    });
  } else {
    // callback({ viewWorldCenter });
  }
}
