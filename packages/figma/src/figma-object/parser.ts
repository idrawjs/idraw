import { compileSchema, decodeBinarySchema } from 'kiwi-schema';
import pako from 'pako';
import type { FigmaNode } from '../types';

function parseBlob(key: string, opts: { bytes: Uint8Array }) {
  const { bytes } = opts;
  const view = new DataView(bytes.buffer);
  let offset = 0;

  switch (key) {
    case 'vectorNetwork':
      if (bytes.length < 12) return;
      const vertexCount = view.getUint32(0, true);
      const segmentCount = view.getUint32(4, true);
      const regionCount = view.getUint32(8, true);
      const vertices = [];
      const segments = [];
      const regions = [];
      offset += 12;

      for (let i = 0; i < vertexCount; i++) {
        if (offset + 12 > bytes.length) return;
        vertices.push({
          styleID: view.getUint32(offset + 0, true),
          x: view.getFloat32(offset + 4, true),
          y: view.getFloat32(offset + 8, true)
        });
        offset += 12;
      }

      for (let i = 0; i < segmentCount; i++) {
        if (offset + 28 > bytes.length) return;
        const startVertex = view.getUint32(offset + 4, true);
        const endVertex = view.getUint32(offset + 16, true);
        if (startVertex >= vertexCount || endVertex >= vertexCount) return;
        segments.push({
          styleID: view.getUint32(offset + 0, true),
          start: {
            vertex: startVertex,
            dx: view.getFloat32(offset + 8, true),
            dy: view.getFloat32(offset + 12, true)
          },
          end: {
            vertex: endVertex,
            dx: view.getFloat32(offset + 20, true),
            dy: view.getFloat32(offset + 24, true)
          }
        });
        offset += 28;
      }

      for (let i = 0; i < regionCount; i++) {
        if (offset + 8 > bytes.length) return;
        let styleID = view.getUint32(offset, true);
        const windingRule = styleID & 1 ? 'NONZERO' : 'ODD';
        styleID >>= 1;
        const loopCount = view.getUint32(offset + 4, true);
        const loops = [];
        offset += 8;

        for (let j = 0; j < loopCount; j++) {
          if (offset + 4 > bytes.length) return;
          const indexCount = view.getUint32(offset, true);
          const indices = [];
          offset += 4;
          if (offset + indexCount * 4 > bytes.length) return;
          for (let k = 0; k < indexCount; k++) {
            const segment = view.getUint32(offset, true);
            if (segment >= segmentCount) return;
            indices.push(segment);
            offset += 4;
          }
          loops.push({ segments: indices });
        }

        regions.push({ styleID, windingRule, loops });
      }

      return { vertices, segments, regions };

    case 'commands':
      const path = [];
      while (offset < bytes.length) {
        switch (bytes[offset++]) {
          case 0:
            path.push('Z');
            break;

          case 1:
            if (offset + 8 > bytes.length) return;
            path.push('M', view.getFloat32(offset, true), view.getFloat32(offset + 4, true));
            offset += 8;
            break;

          case 2:
            if (offset + 8 > bytes.length) return;
            path.push('L', view.getFloat32(offset, true), view.getFloat32(offset + 4, true));
            offset += 8;
            break;

          case 3:
            if (offset + 16 > bytes.length) return;
            path.push(
              'Q',
              view.getFloat32(offset, true),
              view.getFloat32(offset + 4, true),
              view.getFloat32(offset + 8, true),
              view.getFloat32(offset + 12, true)
            );
            offset += 16;
            break;

          case 4:
            if (offset + 24 > bytes.length) return;
            path.push(
              'C',
              view.getFloat32(offset, true),
              view.getFloat32(offset + 4, true),
              view.getFloat32(offset + 8, true),
              view.getFloat32(offset + 12, true),
              view.getFloat32(offset + 16, true),
              view.getFloat32(offset + 20, true)
            );
            offset += 24;
            break;

          default:
            return;
        }
      }
      return path;
  }
}

export function parseCanvasFigBytesToNodeChanges(opts: { bytes: Uint8Array }) {
  const { bytes } = opts;
  const header = String.fromCharCode(...bytes.slice(0, 8));
  if (header !== 'fig-kiwi' && header !== 'fig-jam.') {
    throw new Error('Invalid header');
  }

  const view = new DataView(bytes.buffer);
  const version = view.getUint32(8, true);
  const chunks = [];
  let offset = 12;

  while (offset < bytes.length) {
    const chunkLength = view.getUint32(offset, true);
    offset += 4;
    chunks.push(bytes.slice(offset, offset + chunkLength));
    offset += chunkLength;
  }

  if (chunks.length < 2) throw new Error('Not enough chunks');
  const encodedSchema = pako.inflateRaw(chunks[0]);
  const encodedData = pako.inflateRaw(chunks[1]);
  const schema = compileSchema(decodeBinarySchema(encodedSchema));
  const { nodeChanges, blobs } = schema.decodeMessage(encodedData);

  // Make blob contents easier to understand
  const substituteBlob = (key: string, value: any) => {
    if (key.endsWith('Blob') && typeof value === 'number' && value === value >>> 0 && value < blobs.length) {
      key = key.slice(0, -4);
      value = blobs[value];
      value = parseBlob(key, value) || value;
    }
    return [key, value];
  };

  const walkToParseBlob = (obj: any) => {
    const propKeys = Object.keys(obj);
    propKeys.forEach((propKey: string) => {
      const prop = obj[propKey];
      if (propKey.endsWith('Blob')) {
        const [newKey, newValue] = substituteBlob(propKey, prop);
        obj[newKey] = newValue;
        delete obj[propKey];
      } else if (Array.isArray(prop)) {
        prop.forEach((item) => {
          walkToParseBlob(item);
        });
      } else if (Object.prototype.toString.call(prop) === '[object Object]') {
        walkToParseBlob(prop);
      }
    });
  };
  nodeChanges.forEach((node: any) => {
    walkToParseBlob(node);
  });

  return { version, blobs, nodeChanges };
}

export function parseCanvasFigBytes(opts: { bytes: Uint8Array }) {
  const { version, nodeChanges, blobs } = parseCanvasFigBytesToNodeChanges(opts);
  const nodeMap: Record<string, FigmaNode> = {};
  const originalNodeChanges: FigmaNode[] = nodeChanges.map((node: any) => {
    const item = { ...node };
    const id = `${item.guid.sessionID}:${item.guid.localID}`;
    nodeMap[id] = item;
    return item;
  });

  const nodes = new Map();

  const orderByPosition = (
    { parentIndex: { position: a } }: { parentIndex: { position: number } },
    { parentIndex: { position: b } }: { parentIndex: { position: number } }
  ) => {
    // @ts-ignore
    return (a < b) - (a > b);
  };

  for (const node of nodeChanges) {
    const { sessionID, localID } = node.guid;
    nodes.set(`${sessionID}:${localID}`, node);
  }

  for (const node of nodeChanges) {
    if (node.parentIndex) {
      const { sessionID, localID } = node.parentIndex.guid;
      const parent = nodes.get(`${sessionID}:${localID}`);
      if (parent) {
        parent.children ||= [];
        parent.children.push(node);
      }
    }
  }

  for (const node of nodeChanges) {
    if (node.children) {
      node.children.sort(orderByPosition);
    }
  }

  for (const node of nodeChanges) {
    delete node.parentIndex;
  }

  const root = nodes.get('0:0');

  return { version, root, blobs, backupNodeList: originalNodeChanges, backupNodeMap: nodeMap };
}
