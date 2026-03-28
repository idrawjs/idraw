import type { Material } from '@idraw/types';

/**
 * Convert Material JSON structure back to Material string
 * @param mtrl Material JSON node
 * @returns Material string
 */
export function materialToSVG(mtrl: Material): string {
  return serializeNode(mtrl);
}

const materialTypeMap: Record<string, string> = {
  group: 'g',
};

/**
 * Serialize a single node to Material string
 */
function serializeNode(node: Material, indent: string = '', level: number = 0): string {
  const tagName = materialTypeMap[node.type] || node.type;
  const attributes = serializeAttributes(node);
  const children = node.children || [];
  const textContent = node.text || '';

  // Handle self-closing tags for elements that typically don't have content
  const selfClosingTags = ['circle', 'rect', 'path', 'line', 'polygon', 'polyline', 'ellipse', 'use'];
  const isSelfClosing = selfClosingTags.includes(tagName) && children.length === 0 && !textContent;

  if (isSelfClosing) {
    return `${indent}<${tagName}${attributes} />`;
  }

  // Handle regular elements with content
  let result = `${indent}<${tagName}${attributes}`;

  if (children.length === 0 && !textContent) {
    result += `></${tagName}>`;
  } else {
    result += '>';

    if (textContent) {
      result += escapeMaterialText(textContent);
    }

    if (children.length > 0) {
      const childIndent = indent + '  ';
      result += '\n';
      result += children.map((child) => serializeNode(child, childIndent, level + 1)).join('\n');
      result += `\n${indent}`;
    }

    result += `</${tagName}>`;
  }

  return result;
}

/**
 * Serialize all attributes of a node
 */
function serializeAttributes(node: Material): string {
  const reservedProps = ['type', 'children', 'textContent'];
  const attributes: string[] = [];

  for (const key in node) {
    if (reservedProps.includes(key)) continue;

    const value = node[key as keyof Material];
    if (value !== undefined && value !== null) {
      // Convert camelCase back to kebab-case for attribute names
      const attrName = camelToKebabCase(key);
      attributes.push(`${attrName}="${escapeMaterialAttribute(String(value))}"`);
    }
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Escape text content for Material
 */
function escapeMaterialText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Escape attribute values for Material
 */
function escapeMaterialAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
