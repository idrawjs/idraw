import type { Element, SVGPathCommand } from '@idraw/types';
import { nodeToElementBase, getStrokeColor, getStrokePathCommands, getFillAttributes, getFillColor, getShadow } from './base';
import { nodeToOperations } from './operations';
import type { FigmaNode, FigmaParseOptions, FigmaVectorNode } from '../types';
import { mergeNodeOverrideData } from '../common/node';
import { figmaPaintsToColor } from './color';

type SVGPathDetail = Pick<Element<'path'>['detail'], 'commands' | 'stroke' | 'fill' | 'strokeWidth' | 'fillRule'>;

function getSVGPathDetail(node: FigmaVectorNode, opts: FigmaParseOptions<'VECTOR'>): SVGPathDetail {
  const { vectorData, strokeGeometry, fillGeometry, size, strokeWeight } = node;
  const { overrideProperties } = opts;
  const detail: SVGPathDetail = {
    commands: []
  };

  const fillColor = figmaPaintsToColor(node.fillPaints || [], { w: size.x, h: size.y });
  const strokeColor = getStrokeColor(node);

  // console.log('x --------- ', node.guid);
  // console.log('x --------- strokeGeometry ', strokeGeometry);
  // console.log('x --------- strokeWeight ', strokeWeight);
  // console.log('x --------- strokePaints ', node.strokePaints);
  // console.log('x --------- fillGeometry ', fillGeometry);
  // console.log('x --------- fillPaints ', node.fillPaints);

  // if (strokeWeight > 0 && fillColor && strokeColor && vectorData?.vectorNetwork) {
  //   const pathCmds: SVGPathCommand[] = [];
  //   const { vectorNetwork } = vectorData;
  //   const { segments, vertices } = vectorNetwork;
  //   if (Array.isArray(segments) && Array.isArray(vertices)) {
  //     for (const { start, end } of segments) {
  //       const from = vertices[start.vertex];
  //       const to = vertices[end.vertex];
  //       pathCmds.push({
  //         type: 'M',
  //         params: [from.x, from.y]
  //       });
  //       pathCmds.push({
  //         type: 'C',
  //         params: [from.x + start.dx, from.y + start.dy, to.x + end.dx, to.y + end.dy, to.x, to.y]
  //       });
  //       // ctx.moveTo(from.x, from.y);
  //       // ctx.bezierCurveTo(from.x + start.dx, from.y + start.dy, to.x + end.dx, to.y + end.dy, to.x, to.y);
  //     }
  //   }
  //   detail.commands = pathCmds;

  //   detail.stroke = strokeColor;
  //   detail.strokeWidth = strokeWeight;
  //   detail.fill = fillColor;
  // }
  if (Array.isArray(strokeGeometry) && strokeGeometry.length > 0) {
    detail.commands = getStrokePathCommands(node);
    if (overrideProperties?.fillPaints) {
      if (fillColor) {
        detail.fill = fillColor;
      }
    } else {
      if (strokeColor) {
        detail.fill = strokeColor;
      }
    }
  } else if (Array.isArray(fillGeometry) && fillGeometry.length > 0) {
    const { commands, fillRule } = getFillAttributes(node);
    detail.commands = commands;
    if (fillRule) {
      detail.fillRule = fillRule;
    }
    if (fillColor) {
      detail.fill = fillColor;
    }
  } else if (strokeGeometry) {
    detail.commands = getStrokePathCommands(node);
    if (strokeColor) {
      detail.fill = strokeColor;
    }
  } else if (vectorData.vectorNetwork) {
    const pathCmds: SVGPathCommand[] = [];
    const { vectorNetwork } = vectorData;
    const { segments, vertices } = vectorNetwork;
    if (Array.isArray(segments) && Array.isArray(vertices)) {
      for (const { start, end } of segments) {
        const from = vertices[start.vertex];
        const to = vertices[end.vertex];
        pathCmds.push({
          type: 'M',
          params: [from.x, from.y]
        });
        pathCmds.push({
          type: 'C',
          params: [from.x + start.dx, from.y + start.dy, to.x + end.dx, to.y + end.dy, to.x, to.y]
        });
        // ctx.moveTo(from.x, from.y);
        // ctx.bezierCurveTo(from.x + start.dx, from.y + start.dy, to.x + end.dx, to.y + end.dy, to.x, to.y);
      }
    }
    detail.commands = pathCmds;

    if (strokeColor) {
      detail.stroke = strokeColor;
      detail.strokeWidth = node.strokeWeight || 1;
    }
    if (fillColor) {
      detail.fill = fillColor;
    }
  }

  return detail;
}

export function vectorNodeToPathElement(figmaNode: FigmaNode<'VECTOR'>, opts: FigmaParseOptions<'VECTOR'>): Element<'path'> {
  const overrideData = mergeNodeOverrideData<'VECTOR'>(figmaNode, opts);

  const node = { ...figmaNode, ...overrideData };
  const elemBase = nodeToElementBase(node as FigmaNode);
  const elem: Element<'path'> = {
    ...elemBase,
    type: 'path',
    detail: {
      ...getSVGPathDetail(node as FigmaVectorNode, opts),
      ...(Array.isArray(node.effects) && node.effects.length > 0 ? getShadow(node.effects) : {}),
      // strokeWidth: node.strokeWeight || 1,
      originX: 0,
      originY: 0,
      originW: elemBase.w,
      originH: elemBase.h
    }
  };

  const operations: Required<Element<'rect'>>['operations'] = nodeToOperations(node as FigmaNode);
  // const detail: Required<Element<'rect'>>['detail'] = nodeToBaseDetail(node);
  elem.operations = operations;
  // elem.detail = detail;
  return elem;
}
