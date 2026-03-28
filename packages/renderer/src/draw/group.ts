import type {
  StrictMaterial,
  MaterialType,
  MaterialSize,
  RendererDrawMaterialOptions,
  ViewContext2D,
} from '@idraw/types';
// import { calcViewMaterialSize } from '@idraw/util';
import { drawRect } from './rect';
import { drawCircle } from './circle';
import { drawEllipse } from './ellipse';
import { drawImage } from './image';
import { drawText } from './text';
import { drawSVGCode } from './svg-code';
import { drawForeignObject } from './foreign-object';
import { drawPath } from './path';
import { drawBase, rotateViewMaterial } from './base';

const visiableMinSize = 0.4; // px;

export function drawMaterial(
  ctx: ViewContext2D,
  mtrl: StrictMaterial<MaterialType>,
  opts: RendererDrawMaterialOptions
) {
  if (mtrl?.operations?.invisible === true) {
    return;
  }
  const { width, height } = mtrl;
  const { scale } = opts.viewScaleInfo;
  if (
    (scale < 1 && (width * scale < visiableMinSize || height * scale < visiableMinSize)) ||
    opts.parentOpacity === 0
  ) {
    return;
  }

  const { overrideMaterialMap } = opts;
  if (overrideMaterialMap?.[mtrl.id]?.operations?.invisible) {
    return;
  }

  try {
    switch (mtrl.type) {
      case 'rect': {
        drawRect(ctx, mtrl as StrictMaterial<'rect'>, opts);
        break;
      }
      case 'circle': {
        drawCircle(ctx, mtrl as StrictMaterial<'circle'>, opts);
        break;
      }
      case 'ellipse': {
        drawEllipse(ctx, mtrl as StrictMaterial<'ellipse'>, opts);
        break;
      }
      case 'text': {
        drawText(ctx, mtrl as StrictMaterial<'text'>, opts);
        break;
      }
      case 'image': {
        drawImage(ctx, mtrl as StrictMaterial<'image'>, opts);
        break;
      }
      case 'svgCode': {
        drawSVGCode(ctx, mtrl as StrictMaterial<'svgCode'>, opts);
        break;
      }
      case 'foreignObject': {
        drawForeignObject(ctx, mtrl as StrictMaterial<'foreignObject'>, opts);
        break;
      }
      case 'path': {
        drawPath(ctx, mtrl as StrictMaterial<'path'>, opts);
        break;
      }
      case 'group': {
        const assets = {
          ...(opts.materialAssets || {}),
          ...((mtrl as StrictMaterial<'group'>).assets || {}),
        };
        drawGroup(ctx, mtrl as StrictMaterial<'group'>, {
          ...opts,
          materialAssets: assets,
        });
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export function drawGroup(ctx: ViewContext2D, mtrl: StrictMaterial<'group'>, opts: RendererDrawMaterialOptions) {
  // const { viewScaleInfo } = opts;
  // const { x, y } = calcViewMaterialSize(mtrl, { viewScaleInfo }) || mtrl;

  rotateViewMaterial(ctx, mtrl, opts, () => {
    drawBase(ctx, mtrl, opts);
  });

  // // render group children
  // const { offsetLeft, offsetTop } = viewScaleInfo;
  // const translateX = x - offsetLeft;
  // const translateY = y - offsetTop;
  // // move start point
  // ctx.translate(translateX, translateY);
  // rotateViewMaterial(
  //   ctx,
  //   {
  //     ...mtrl,
  //     x: x - translateX,
  //     y: y - translateY,
  //   },
  //   opts,
  //   () => {
  //     // if (mtrl.overflow === 'hidden') {
  //     //   ctx.save();
  //     //   // TODO
  //     // }
  //     // if (mtrl.overflow === 'hidden') {
  //     //   ctx.restore();
  //     // }
  //   }
  // );
  // // reset start point
  // ctx.translate(-translateX, -translateY);

  if (Array.isArray(mtrl.children)) {
    const { parentMaterialSize: parentSize } = opts;
    const newParentSize: MaterialSize = {
      x: parentSize.x + mtrl.x,
      y: parentSize.y + mtrl.y,
      width: mtrl.width || parentSize.width,
      height: mtrl.height || parentSize.height,
      angle: mtrl.angle,
    };
    const { calculator } = opts;

    for (let i = 0; i < mtrl.children.length; i++) {
      let child = mtrl.children[i];
      child = {
        ...child,
        ...{
          x: newParentSize.x + child.x,
          y: newParentSize.y + child.y,
        },
      };
      if (opts.forceDrawAll !== true) {
        if (!calculator?.needRender(child)) {
          continue;
        }
      }

      try {
        drawMaterial(ctx, child, opts);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
  }
}
