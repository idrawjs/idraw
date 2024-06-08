import type { Element, ElementBaseDetail, SVGPathCommand, SVGPathCommandType } from '@idraw/types';
import { createUUID, rotateVertexes, parseAngleToRadian, calcElementCenterFromVertexes } from '@idraw/util';
import type { FigmaNode, FigmaNodeType, FigmaNodeFillBase, FigmaNodeStrokeBase, FigmaEffect, FigmaFillPaintImage } from '../types';
import { figmaPaintsToHexColor, figmaPaintsToColor, figmaColorToHex } from './color';

export function nodeToElementBase(node: FigmaNode<FigmaNodeType>): Omit<Element, 'type' | 'detail'> {
  const {
    m00,
    m01,
    m02,
    // m10,
    // m11,
    m12
  } = node.transform;
  const originAngle = Math.round((Math.atan2(m01, m00) * 180) / Math.PI);
  const angle = 0 - originAngle;
  const elemBase = {
    uuid: createUUID(),
    name: node.name,
    x: m02 || 0,
    y: m12 || 0,
    w: node?.size?.x || 0,
    h: node?.size?.y || 0,
    angle
  };

  if (originAngle !== 0) {
    let { x, y, w, h } = elemBase;
    const rotateCenter = { x, y };
    const v0 = { x, y };
    const v1 = { x: x + w, y };
    const v2 = { x: x + w, y: y + h };
    const v3 = { x, y: y + h };
    const radian = parseAngleToRadian(angle);
    const ves = rotateVertexes(rotateCenter, [v0, v1, v2, v3], radian);
    const center = calcElementCenterFromVertexes(ves);
    elemBase.x = center.x - w / 2;
    elemBase.y = center.y - h / 2;
  }
  return elemBase;
}

export function nodeToBaseDetail(node: FigmaNode<FigmaNodeType>): ElementBaseDetail {
  let detail: ElementBaseDetail = {};
  const {
    fillPaints,
    strokeWeight,
    strokePaints,
    cornerRadius,
    dashPattern,
    borderStrokeWeightsIndependent,
    borderBottomWeight,
    borderLeftWeight,
    borderRightWeight,
    borderTopWeight,
    rectangleCornerRadiiIndependent,
    rectangleBottomLeftCornerRadius,
    rectangleBottomRightCornerRadius,
    rectangleTopLeftCornerRadius,
    rectangleTopRightCornerRadius,
    strokeAlign,
    opacity
  } = node as FigmaNode<'ROUNDED_RECTANGLE'>;
  const background = figmaPaintsToColor(fillPaints, {
    w: node.size.x,
    h: node.size.y
  });
  if (background) {
    detail.background = background;
  }
  if (cornerRadius > 0) {
    detail.borderRadius = cornerRadius;
  } else if (rectangleCornerRadiiIndependent === true) {
    detail.borderRadius = [
      rectangleTopLeftCornerRadius || 0,
      rectangleTopRightCornerRadius || 0,
      rectangleBottomRightCornerRadius || 0,
      rectangleBottomLeftCornerRadius || 0
    ];
  }
  detail.borderDash = dashPattern || [];
  detail.boxSizing = 'border-box';
  if (strokeAlign === 'CENTER') {
    detail.boxSizing = 'center-line';
  } else if (strokeAlign === 'OUTSIDE') {
    detail.boxSizing = 'content-box';
  }

  if (strokePaints?.length === 1 && strokePaints[0].color) {
    const hexColor = figmaPaintsToHexColor(strokePaints);
    if (hexColor) {
      detail.borderColor = hexColor;
    }

    if (borderStrokeWeightsIndependent) {
      detail.borderWidth = [borderTopWeight || 0, borderRightWeight || 0, borderBottomWeight || 0, borderLeftWeight || 0];
    } else {
      detail.borderWidth = strokeWeight;
    }
  }

  if (typeof opacity === 'number' && opacity >= 0) {
    detail.opacity = opacity;
  }

  detail = {
    ...detail,
    ...getShadow(node.effects)
  };

  return detail;
}

export function getShadow(effects?: FigmaEffect[]): Pick<Partial<ElementBaseDetail>, 'shadowBlur' | 'shadowColor' | 'shadowOffsetX' | 'shadowOffsetY'> {
  const shadow = {};
  if (Array.isArray(effects) && effects.length > 0) {
    for (let i = 0; i < effects.length; i++) {
      const { color, offset, spread = 0, type, visible, radius } = effects[i];
      if (visible === true && type === 'DROP_SHADOW') {
        return {
          shadowColor: figmaColorToHex(color),
          shadowBlur: spread || radius || 0, // TODO
          shadowOffsetX: offset.x || 0,
          shadowOffsetY: offset.y || 0
        };
      }
    }
  }
  return shadow;
}

export function getStrokeColor(node: FigmaNodeStrokeBase): string | null {
  const { strokePaints } = node;
  let stroke: string | null = null;
  if (strokePaints?.length > 0) {
    const hexColor = figmaPaintsToHexColor(strokePaints);
    if (hexColor) {
      stroke = hexColor;
    }
  }
  return stroke;
}

export function getFillColor(node: FigmaNodeFillBase): string | null {
  const { fillPaints } = node;
  let fill: string | null = null;
  if (fillPaints?.length === 1 && fillPaints[0].color && fillPaints[0].type === 'SOLID') {
    const hexColor = figmaPaintsToHexColor(fillPaints);
    if (hexColor) {
      fill = hexColor;
    }
  }
  return fill;
}

export function getFillPathCommands(node: FigmaNodeFillBase): SVGPathCommand[] {
  const pathCmds: SVGPathCommand[] = [];
  const { fillGeometry } = node;
  if (Array.isArray(fillGeometry) && fillGeometry[0] && Array.isArray(fillGeometry[0]?.commands)) {
    const { commands } = fillGeometry[0];
    let pathCmd: SVGPathCommand | null = null;

    commands.forEach((item, i) => {
      if (typeof item === 'string') {
        if (pathCmd?.type && Array.isArray(pathCmd.params)) {
          pathCmds.push(pathCmd);
        }
        pathCmd = { type: item as SVGPathCommandType, params: [] };
      } else if (typeof item === 'number' && Array.isArray(pathCmd?.params)) {
        pathCmd.params.push(item);
      }

      if (i === commands.length - 1 && pathCmd) {
        pathCmds.push(pathCmd);
        pathCmd = null;
      }
    });
  }
  return pathCmds;
}

export function getFillAttributes(node: FigmaNodeFillBase): { commands: SVGPathCommand[]; fillRule?: string } {
  const pathCmds: SVGPathCommand[] = [];
  const { fillGeometry } = node;
  let fillRule: string | undefined = undefined;
  if (Array.isArray(fillGeometry) && fillGeometry[0] && Array.isArray(fillGeometry[0]?.commands)) {
    const { commands, windingRule } = fillGeometry[0];
    let pathCmd: SVGPathCommand | null = null;
    if (windingRule === 'ODD') {
      fillRule = 'evenodd';
    } else if (windingRule === 'NONZERO') {
      fillRule = 'nonzero';
    }

    commands.forEach((item, i) => {
      if (typeof item === 'string') {
        if (pathCmd?.type && Array.isArray(pathCmd.params)) {
          pathCmds.push(pathCmd);
        }
        pathCmd = { type: item as SVGPathCommandType, params: [] };
      } else if (typeof item === 'number' && Array.isArray(pathCmd?.params)) {
        pathCmd.params.push(item);
      }

      if (i === commands.length - 1 && pathCmd) {
        pathCmds.push(pathCmd);
        pathCmd = null;
      }
    });
  }
  const attrs: { commands: SVGPathCommand[]; fillRule?: string } = {
    commands: pathCmds
  };
  if (fillRule) {
    attrs.fillRule = fillRule;
  }
  return attrs;
}

export function getStrokePathCommands(node: FigmaNodeStrokeBase): SVGPathCommand[] {
  const pathCmds: SVGPathCommand[] = [];
  const { strokeGeometry } = node;
  if (Array.isArray(strokeGeometry) && strokeGeometry[0] && Array.isArray(strokeGeometry[0]?.commands)) {
    const { commands } = strokeGeometry[0];
    let pathCmd: SVGPathCommand | null = null;

    commands.forEach((item, i) => {
      if (typeof item === 'string') {
        if (pathCmd?.type && Array.isArray(pathCmd.params)) {
          pathCmds.push(pathCmd);
        }
        pathCmd = { type: item as SVGPathCommandType, params: [] };
      } else if (typeof item === 'number' && Array.isArray(pathCmd?.params)) {
        pathCmd.params.push(item);
      }

      if (i === commands.length - 1 && pathCmd) {
        pathCmds.push(pathCmd);
        pathCmd = null;
      }
    });
  }
  return pathCmds;
}

export function hasFillImage(node: FigmaNode) {
  const { fillPaints } = node;
  if (Array.isArray(fillPaints)) {
    for (let i = 0; i < fillPaints.length; i++) {
      const paint = fillPaints[i];
      if (paint.visible === true && (paint as FigmaFillPaintImage).image) {
        return true;
      }
    }
  }
  return false;
}
