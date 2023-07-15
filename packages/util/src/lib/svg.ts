import type { HTMLNode, Element, Elements, SVGPathCommand, SVGPathCommandType } from '@idraw/types';
import { parseHTML, generateHTML } from './html';
import { createUUID } from './uuid';
import { parseSVGPath } from './svg-path';
import { is } from './is';

export function flatSVGNode(svg: HTMLNode): HTMLNode {
  const nodes: HTMLNode[] = [];
  const groupNames = ['g'];
  const ignoreNames = ['defs'];
  const walkNode = (node: HTMLNode) => {
    if (node.type === 'element') {
      if (groupNames.includes(node.name as string)) {
        node.children.forEach((item) => {
          walkNode(item);
        });
      } else if (ignoreNames.includes(node.name as string)) {
        // TODO
      } else {
        nodes.push(node);
      }
    }
  };
  svg.children.forEach((child) => {
    walkNode(child);
  });
  return {
    type: svg.type,
    name: svg.name,
    attributes: { ...svg.attributes },
    children: nodes,
    isVoid: false
  };
}

// rotate(-10 50 100)
// translate(-36 45.5)
// skewX(40)
// scale(1 0.5)
function parseTransform(value: string) {
  const translateReg = /translate\([\s]{0,}(-?\d+(?:\.\d+)?)[\s]{0,}(-?\d+(?:\.\d+)?)[\s]{0,}\)/i;
  const translateMatchResult = translateReg.exec(value);
  const translateX = translateMatchResult?.[1] ? parseFloat(translateMatchResult?.[1]) : null;
  const translateY = translateMatchResult?.[2] ? parseFloat(translateMatchResult?.[2]) : null;
  return {
    translateX,
    translateY
  };
}

export function parseSVGCodeToFlatGroupElement(code: string): Element<'group'> {
  const nodes = parseHTML(code);
  let svgNode: HTMLNode | null = null;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]?.type === 'element' && nodes[i]?.name === 'svg') {
      svgNode = nodes[i];
      break;
    }
  }
  const group: Element<'group'> = {
    uuid: createUUID(),
    type: 'group',
    x: 0,
    y: 0,
    w: parseFloat(svgNode?.attributes.width || '0'),
    h: parseFloat(svgNode?.attributes.height || '0'),
    detail: {
      children: []
    }
  };

  if (svgNode && Array.isArray(svgNode.children)) {
    const flattedSVGNode = flatSVGNode(svgNode);
    const flattedSVG = generateHTML([flattedSVGNode]);
    // console.log('flattedSVGNode =====', flattedSVGNode);
    // console.log('flattedSVGNode.children ====', flattedSVGNode?.children);
    const basePosition = -999999;
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = `${basePosition}px`;
    tempDiv.style.left = `${basePosition}px`;
    tempDiv.innerHTML = flattedSVG;
    document.body.appendChild(tempDiv);
    const svgDOM = tempDiv.querySelector('svg') as SVGElement;
    // const svgRect = svgDOM.getBoundingClientRect();
    // group.w = svgRect.width;
    // group.h = svgRect.height;

    flattedSVGNode.children.forEach((child, i) => {
      let clientRect = svgDOM?.children[i].getBoundingClientRect();
      let originX = clientRect.x - basePosition;
      let originY = clientRect.y - basePosition;
      let originW = clientRect.width;
      let originH = clientRect.height;
      const fillColor = child.attributes.fill || 'transparent';
      const strokeColor = child.attributes.stroke || 'transparent';
      let lineWidth = 0;
      if (child.attributes.stroke) {
        lineWidth = 1;
      }
      if (child.name === 'path') {
        const commands = parseSVGPath(child.attributes.d || '');
        const textElem: Element<'path'> = {
          uuid: createUUID(),
          type: 'path',
          x: originX,
          y: originY,
          w: originW,
          h: originH,
          detail: {
            commands,
            fill: child.attributes.fill,
            originX,
            originY,
            originW,
            originH
          }
        };
        group.detail.children.push(textElem);
      } else if (child.name === 'text') {
        const text = svgDOM?.children[i].textContent || '';

        const fontSize = parseInt(child.attributes['font-size'] || '12');
        const fontFamily = child.attributes['font-family'] || '';
        if (svgDOM?.children[i]?.children[0]?.nodeName === 'tspan') {
          clientRect = svgDOM.children[i].children[0].getBoundingClientRect();
        }

        originX = clientRect.x - basePosition;
        originY = clientRect.y - basePosition;
        // originW = Math.max(clientRect.width, fontSize * text.length);
        originW = clientRect.width;
        originH = clientRect.height;
        const fontWidth = fontSize * text.length;
        if (fontWidth > originW) {
          originX = originX - (fontWidth - originW) / 2;
          originW = fontWidth;
        }
        const textElem: Element<'text'> = {
          uuid: createUUID(),
          type: 'text',
          x: originX,
          y: originY,
          w: originW,
          h: originH,
          detail: {
            text,
            color: fillColor,
            fontSize,
            fontFamily
          }
        };
        if (is.numberStr(child.attributes['fill-opacity'])) {
          textElem.detail.opacity = parseFloat(child.attributes['fill-opacity'] as string);
        }
        group.detail.children.push(textElem);
      } else if (child.name === 'rect') {
        // if (child.attributes.transform) {
        //   const { translateX, translateY } = parseTransform(child.attributes.transform);
        //   if (translateX) {
        //     originW = originW * translateX;
        //   }
        //   if (translateY) {
        //     originH = originH * translateY;
        //   }
        // }

        const rectElem: Element<'rect'> = {
          uuid: createUUID(),
          type: 'rect',
          x: originX,
          y: originY,
          w: originW,
          h: originH,
          detail: {
            bgColor: fillColor,
            borderColor: strokeColor,
            borderWidth: lineWidth
          }
        };
        group.detail.children.push(rectElem);
      }
    });
    tempDiv.remove();
    // TODO
  }

  return group;
}

export function parseSVGCodeToGroupElement(code: string): Element<'group'> {
  const basePosition = -999999;
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = `${basePosition}px`;
  tempDiv.style.left = `${basePosition}px`;
  tempDiv.innerHTML = code;
  document.body.appendChild(tempDiv);
  const svgDOM = tempDiv.querySelector('svg') as unknown as HTMLElement;
  const svgRect = svgDOM.getBoundingClientRect() as DOMRect;
  console.log('svgRect =====', svgRect);
  const group: Element<'group'> = {
    uuid: createUUID(),
    type: 'group',
    x: 0,
    y: 0,
    w: svgRect.width,
    h: svgRect.height,
    detail: {
      children: []
    }
  };

  const _parseDOMChildren = (elem: Element<'group'>, dom: HTMLElement) => {
    if (dom.children.length > 0) {
      for (let i = 0; i < dom.children.length; i++) {
        const child = dom.children[i] as HTMLElement;

        const parentRect = dom.getBoundingClientRect();
        let childRect = child.getBoundingClientRect();

        // let originX = childRect.x - parentRect.x;
        // let originY = childRect.y - parentRect.y;
        let originX = childRect.x - parentRect.x;
        let originY = childRect.y - parentRect.y;
        let originW = childRect.width;
        let originH = childRect.height;

        const fillColor = child.getAttribute('fill') || 'transparent';
        const strokeColor = child.getAttribute('stroke') || 'transparent';
        const fillOpacity = child.getAttribute('fill-opacity') || '';
        const opacity = parseFloat(fillOpacity) > 0 ? parseFloat(fillOpacity) : 1;
        let lineWidth = 0;
        if (child.getAttribute('stroke')) {
          lineWidth = 1;
        }

        if (child.nodeName === 'path') {
          const commands = parseSVGPath(child.getAttribute('d') || '');
          const textElem: Element<'path'> = {
            uuid: createUUID(),
            type: 'path',
            x: originX,
            y: originY,
            w: originW,
            h: originH,
            detail: {
              commands,
              fill: fillColor,
              originX: childRect.x - basePosition,
              originY: childRect.y - basePosition,
              originW,
              originH,
              opacity
            }
          };
          elem.detail.children.push(textElem);
        } else if (child.nodeName === 'text') {
          const text = child.textContent || '';

          const fontSize = parseInt(child.getAttribute('font-size') || '12');
          const fontFamily = child.getAttribute('font-family') || '';
          if (child?.children[0]?.nodeName === 'tspan') {
            childRect = child.children[0].getBoundingClientRect();
          }

          originW = childRect.width;
          originH = childRect.height;
          const fontWidth = fontSize * text.length;
          if (fontWidth > originW) {
            originX = originX - (fontWidth - originW) / 2;
            originW = fontWidth;
          }
          const textElem: Element<'text'> = {
            uuid: createUUID(),
            type: 'text',
            x: originX,
            y: originY,
            w: originW,
            h: originH,
            detail: {
              text,
              color: fillColor,
              fontSize,
              fontFamily,
              opacity
            }
          };
          if (is.numberStr(child.getAttribute('fill-opacity'))) {
            textElem.detail.opacity = parseFloat(child.getAttribute('fill-opacity') as string);
          }
          elem.detail.children.push(textElem);
        } else if (child.nodeName === 'rect') {
          const rectElem: Element<'rect'> = {
            uuid: createUUID(),
            type: 'rect',
            x: originX,
            y: originY,
            w: originW,
            h: originH,
            detail: {
              bgColor: fillColor,
              // bgColor: '#0000001F',
              borderColor: strokeColor,
              borderWidth: lineWidth,
              opacity
            }
          };
          elem.detail.children.push(rectElem);
        } else if (child.nodeName === 'g') {
          const groupElem: Element<'group'> = {
            uuid: createUUID(),
            type: 'group',
            x: originX,
            y: originY,
            w: originW,
            h: originH,
            detail: {
              children: [],
              opacity
            }
          };
          elem.detail.children.push(groupElem);
          _parseDOMChildren(groupElem, child);
        }
      }
    }
  };

  _parseDOMChildren(group, svgDOM);

  tempDiv.remove();

  return group;
}
