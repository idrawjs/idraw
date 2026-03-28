import { createUUID } from '@idraw/util';
import type { StrictMaterial, Material, MaterialType } from '@idraw/types';

const svgMaterialTypeMap: Record<string, string> = {
  svg: 'group',
  g: 'group',
};

const validAttributes: Array<keyof Material> = [
  'x',
  'y',
  'width',
  'height',
  'angle',
  'id',
  'name',
  'transform',
  'opacity',
  'display',
  'visibility',
  'overflow',
  'fill',
  'fillOpacity',
  'fillRule',
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textAnchor',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'writingMode',
  'textAlign',
  'verticalAlign',
  'cornerRadius',
  'commands',
  'children',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
];

const numArrAttrKeys: string[] = ['strokeDasharray'];

const numAttrKeys: string[] = [
  'x',
  'y',
  'width',
  'height',
  'opacity',
  'fillOpacity',
  'strokeWidth',
  'strokeOpacity',
  'strokeDashoffset',
  'fontSize',
  'fontWeight',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
];

function parseAttrValue(key: string, value: string): any {
  if (numAttrKeys.includes(key) && /^[0-9.]{0,}$/.test(value)) {
    return parseFloat(value);
  }
  if (numArrAttrKeys.includes(key)) {
    return value
      .match(/[0-9.]{0,}/g)
      ?.filter((str) => !!str)
      .map((str) => parseFloat(str));
  }

  return value;
}

/**
 * Convert SVG string to JSON structure
 * @param svgString SVG string input
 * @returns JSON representation of SVG structure
 */
function prepareSVGString(svgString: string): string {
  // Remove XML declaration and DOCTYPE if present
  return svgString
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .trim();
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Set property on node, handling reserved property names
 */
function setNodeProperty(node: Material, key: string, value: string): void {
  // If property name conflicts with reserved properties, prefix it
  (node as any)[key] = parseAttrValue(key, value);
}

/**
 * Parse style attribute and split into individual properties
 */
function parseStyleAttribute(style: string, node: Material): void {
  const stylePairs = style.split(';');

  for (const pair of stylePairs) {
    const [key, value] = pair.split(':').map((s) => s.trim());
    if (key && value) {
      // Convert style property names to camelCase and add to node
      const camelCaseKey = kebabToCamelCase(key);
      setNodeProperty(node, camelCaseKey, value);
    }
  }
}

/**
 * Process transform attribute
 */
function processTransformAttribute(element: Element, node: Material): void {
  const transform = element.getAttribute('transform');
  if (transform) {
    setNodeProperty(node, 'transform', transform);
  }
}

/**
 * Process all element attributes directly on the node (flattened)
 */
function processAttributes(element: Element, node: Material): void {
  // Process regular attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const camelCaseKey = kebabToCamelCase(attr.name);
    if (validAttributes.includes(camelCaseKey as keyof Material)) {
      setNodeProperty(node, camelCaseKey, attr.value);
    }
  }

  if (!node.id) {
    node.id = createUUID();
  }

  // Special handling for style attribute - split into individual properties
  const style = element.getAttribute('style');
  if (style) {
    parseStyleAttribute(style, node);
  }

  // Special handling for transform attribute
  processTransformAttribute(element, node);
}

/**
 * Get text content of element
 */
function getTextContent(element: Element): string {
  let text = '';

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent?.trim() || '';
    }
  }

  return text;
}

function parseElement(element: Element): Material {
  const tagName = element.tagName;
  // Create base node structure
  const node: Material = {
    type: (svgMaterialTypeMap[tagName] || tagName) as MaterialType,
    children: [],
  } as unknown as Material;

  if (tagName === 'svg') {
    const viewBox = element.getAttribute('viewBox') || '';
    const items = viewBox.split(' ');
    const nums: number[] = [];
    if (items.length) {
      items.forEach((str) => {
        const num = parseFloat(str);
        if (num >= 0 || num < 0) {
          nums.push(num);
        }
      });
    }
    if (nums.length >= 4) {
      node.x = nums[0];
      node.y = nums[1];
      node.width = nums[2];
      node.height = nums[3];
    }
  }

  // Process all attributes directly on the node (flattened)
  processAttributes(element, node);

  // Handle text content
  const text = getTextContent(element);
  if (text) {
    node.text = text;
  }

  // Recursively process child elements
  node.children = [];
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    const mtrl = parseElement(child);
    if (mtrl) {
      node.children.push(mtrl);
    }
  }

  return node;
}

export function svgToMaterial(svg: string): StrictMaterial<'group'> {
  const parser = new DOMParser();

  // Clean and prepare SVG string
  const cleanSVGString = prepareSVGString(svg);

  // Parse as XML document
  const xmlDoc = parser.parseFromString(cleanSVGString, 'image/svg+xml');

  // Check for parsing errors
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error(`SVG parsing error: ${parseError.textContent}`);
  }

  const svgElement = xmlDoc.documentElement;
  if (svgElement.tagName.toLowerCase() !== 'svg') {
    throw new Error('Input is not a valid SVG document');
  }

  return parseElement(svgElement) as StrictMaterial<'group'>;
}

// export function materialToSVG(svgString: string): Material {
//   const parser = new SVGCodeConverter();
//   return parser.parse(svgString);
// }

// Usage example
/*
const svgString = `
<svg width="100" height="100" viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" fill="red" stroke="black" stroke-width="2" style="opacity:0.8;stroke-linecap:round;"/>
  <circle cx="50" cy="50" r="30" fill="blue" transform="rotate(45 50 50)">
    <animate attributeName="r" from="10" to="30" dur="1s" repeatCount="indefinite"/>
  </circle>
  <text x="50" y="60" text-anchor="middle" font-size="12" font-family="Arial">Hello SVG</text>
</svg>
`;

// Usage example
try {
  const jsonResult = svgToJSON.parse(svgString);
  console.log(jsonResult);
  
  // Expected structure:
  // {
  //   type: "svg",
  //   width: "100",
  //   height: "100", 
  //   viewBox: "0 0 100 100",
  //   children: [
  //     {
  //       type: "rect",
  //       x: "10",
  //       y: "10",
  //       width: "80",
  //       height: "80",
  //       fill: "red",
  //       stroke: "black",
  //       strokeWidth: "2",
  //       opacity: "0.8",
  //       strokeLinecap: "round",
  //       children: []
  //     },
  //     {
  //       type: "circle",
  //       cx: "50",
  //       cy: "50",
  //       r: "30",
  //       fill: "blue",
  //       transform: "rotate(45 50 50)",
  //       children: [
  //         {
  //           type: "animate",
  //           attributeName: "r",
  //           from: "10",
  //           to: "30",
  //           dur: "1s",
  //           repeatCount: "indefinite",
  //           children: []
  //         }
  //       ]
  //     },
  //     {
  //       type: "text",
  //       x: "50",
  //       y: "60",
  //       textAnchor: "middle",
  //       fontSize: "12",
  //       fontFamily: "Arial",
  //       text: "Hello SVG",
  //       children: []
  //     }
  //   ]
  // }
  
  const jsonString = svgToJSON.parseToString(svgString);
  console.log(jsonString);
} catch (error) {
  console.error('Error parsing SVG:', error);
}
*/
