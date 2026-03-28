import { Point } from './point';
import type { PathCommand } from './path';

export interface MaterialSize {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number; // portable attribute of transform.rotate
}

/** Material transform */
type MaterialTransform = {
  rotate?: number[];
  translate?: number[];
  skew?: number[];
  scale?: number[];
  matrix?: number[];
};

/** Transform matrix interface */
type MaterialTransformMatrix = [number, number, number, number, number, number];

export type MaterialColor = string | LinearGradientColor | RadialGradientColor;

export type MaterialBase = MaterialSize & {
  id: string;
  name?: string;

  // Transform and display attributes
  transform?: MaterialTransform | MaterialTransformMatrix;

  // basic
  opacity?: number;
  display?: 'inline' | 'block' | 'none' | 'inline-block';
  visibility?: 'visible' | 'hidden' | 'collapse';
  overflow?: 'visible' | 'hidden'; // default: 'visible'

  // Fill attributes
  fill?: MaterialColor;
  fillOpacity?: number;
  fillRule?: 'nonzero' | 'evenodd';

  // Stroke attributes
  stroke?: MaterialColor;
  strokeWidth?: number | [number, number, number, number]; // [top, right, bottom, left]
  strokeOpacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: number[];
  strokeDashoffset?: number;
  strokeMiterlimit?: number;

  // Text attributes
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number | string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAnchor?: 'start' | 'middle' | 'end';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  letterSpacing?: 'normal' | number;
  wordSpacing?: 'normal' | number;
  writingMode?: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  // Text special attributes
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';

  // Material special attributes
  cornerRadius?: number | [number, number, number, number]; // [top-left, top-right, bottom-left, bottom-right]
  // boxSizing?: 'content-box' | 'border-box' | 'center-line'; // default center-line
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;

  // // // Filter and mask attributes
  // // filter?: string;
  // // mask?: string;
  // // TODO
  // clipPath?: {
  //   commands: PathCommand[];
  //   originX: number;
  //   originY: number;
  //   originW: number;
  //   originH: number;
  // };
};

export type MaterialClipPath = Pick<MaterialSVGPathAttributes, 'commands'> & {
  originX?: number; // TODO
  originY?: number; // TODO
  originW?: number; // TODO
  originH?: number; // TODO
};

// export type MaterialSVGPathClipPath = Pick<
//   MaterialSVGPathAttributes,
//   'commands' | 'originX' | 'originY' | 'originW' | 'originH'
// >;

export interface TransformMatrix {
  method: 'matrix';
  params: [number, number, number, number, number];
}

export interface MaterialAssetsItem {
  type: 'svgCode' | 'image' | 'foreignObject';
  value: string;
}

export interface MaterialAssets {
  [assetId: string]: MaterialAssetsItem;
}

export interface TransformTranslate {
  method: 'translate';
  params: [number, number];
}

export interface TransformRotate {
  method: 'rotate';
  params: [number];
}

export interface TransformScale {
  method: 'scale';
  params: [number, number];
}

export type TransformAction = TransformMatrix | TransformTranslate | TransformRotate | TransformScale;

export interface GradientStop {
  offset: number; // [0, 1] eg. 0.5
  color: string;
}

export interface LinearGradientColor {
  type: 'linear-gradient';
  start: Point;
  end: Point;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

type GadialCircle = Point & {
  radius: number;
};

export interface RadialGradientColor {
  type: 'radial-gradient';
  inner: GadialCircle;
  outer: GadialCircle;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

export type MaterialBaseAttributes = Omit<MaterialBase, 'id' | 'x' | 'y' | 'width' | 'height' | 'angle'> & {
  // background?: string | LinearGradientColor | RadialGradientColor;
  // opacity?: number;
  // // clipPath?: MaterialClipPath;
  // clipPathStrokeWidth?: number;
  // clipPathStrokeColor?: string;
};

// export type MaterialBaseAttributes = MaterialBase;

export type MaterialRectAttributes = Partial<MaterialBase> & {
  rx?: number;
  ry?: number;
};

export interface MaterialTextAttributes extends MaterialBaseAttributes {
  text: string;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textShadowBlur?: number;
  minInlineSize?: 'maxContent' | 'auto';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  wordBreak?: 'break-all' | 'normal'; // default: 'normal'
}

export interface MaterialCircleAttributes extends MaterialBaseAttributes {
  cx: number;
  cy: number;
  r: number;
}

export interface MaterialEllipseAttributes extends MaterialBaseAttributes {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface MaterialForeignObjectAttributes extends MaterialBaseAttributes {
  content: string;
  originW?: number; // TODO
  originH?: number; // TODO
}

export interface MaterialImageAttributes extends MaterialBaseAttributes {
  href: string;
  originW?: number;
  originH?: number;
  scaleMode?: 'auto' | 'fill' | 'fit' | 'tile';
}

export interface MaterialSVGCodeAttributes extends MaterialBaseAttributes {
  code: string;
}

export interface MaterialGroupAttributes extends MaterialBaseAttributes {
  children: Material[];
  overflow?: 'hidden' | 'visible';
  assets?: MaterialAssets;
}

export type MaterialPathAttributes = MaterialBaseAttributes & {
  // path: string;
  commands: PathCommand[];
  // fill?: string | LinearGradientColor | RadialGradientColor;
  // stroke?: string;
  // strokeWidth?: number;
  // strokeLineCap?: 'butt' | 'round' | 'square';
  // fillRule?: string; // "evenodd" | "nonzero"
};

export type MaterialSVGPathAttributes = Omit<MaterialPathAttributes, 'clipPath'> & {
  originX: number;
  originY: number;
  originW: number;
  originH: number;
  // clipPath?: MaterialSVGPathClipPath;
};

export type MaterialAttributesMap = {
  rect: MaterialRectAttributes;
  circle: MaterialCircleAttributes;
  ellipse: MaterialEllipseAttributes;
  text: MaterialTextAttributes;
  image: MaterialImageAttributes;
  foreignObject: MaterialForeignObjectAttributes;
  svgCode: MaterialSVGCodeAttributes;
  group: MaterialGroupAttributes;
  path: MaterialPathAttributes;
};

// export type MaterialType = 'text' | 'rect' | 'circle' | 'image' | 'svgCode' | 'foreignObject' | 'group';
export type MaterialType = keyof MaterialAttributesMap;

export interface MaterialOperations {
  locked?: boolean;
  invisible?: boolean;
  rotatable?: boolean;
  limitRatio?: boolean;
  resizeEffect?: 'absolute' | 'deepResize' | 'fixed'; // for Group  default "absolute"
  renderPathTrace?: boolean; // for Path Material
  lastModified?: number; // TODO
}

export type StrictMaterial<
  T extends MaterialType = MaterialType,
  E extends Record<string, any> = Record<string, any>,
> = MaterialBase & {
  id: string;
  name?: string | null;
  type: T;
  operations?: MaterialOperations;
  extends?: E;
} & MaterialAttributesMap[T];

export type MaterialAttributeKey = keyof Material;

export type Material = MaterialBase &
  Partial<MaterialRectAttributes> &
  Partial<MaterialCircleAttributes> &
  Partial<MaterialTextAttributes> &
  Partial<MaterialImageAttributes> &
  Partial<MaterialForeignObjectAttributes> &
  Partial<MaterialSVGCodeAttributes> &
  Partial<MaterialGroupAttributes> &
  Partial<MaterialPathAttributes> &
  Partial<MaterialSVGPathAttributes> & {
    id: string;
    name?: string | null;
    type: MaterialType;
    operations?: MaterialOperations;
  };

export type MaterialPosition = number[];
