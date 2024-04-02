// import { PaintData } from './paint';

type DataElementAttrs = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  operation?: {
    lock?: boolean;
    invisible?: boolean;
    disableScale?: boolean;
    disableRotate?: boolean;
    limitRatio?: boolean;
  };
  extension?: { [key: string]: any } | any;
};

type DataElementBase<T extends keyof DataElemDesc | DataElemType> =
  DataElementAttrs & {
    name?: string;
    uuid?: string;
    type: T | DataElemType;
    desc: DataElemDesc[T];
  };

type DataElement<T extends keyof DataElemDesc | DataElemType> =
  DataElementBase<T> & {
    uuid: string;
  };

type DataElemDescBase = {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
};

type DataElemBoxDesc = {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
} & DataElemDescBase;

type DataElemDesc = {
  text: DataElemDescText;
  rect: DataElemDescRect;
  circle: DataElemDescCircle;
  image: DataElemDescImage;
  svg: DataElemDescSVG;
  html: DataElemDescHTML;
  // paint: DataElemDescPaint,
};

// enum DataElemType {
//   text = 'text',
//   rect = 'rect',
//   circle = 'circle',
//   image = 'image',
//   svg = 'svg',
//   html = 'html',
// }

type DataElemType = 'text' | 'rect' | 'circle' | 'image' | 'svg' | 'html';

type DataElemDescRect = {
  bgColor?: string;
} & DataElemBoxDesc;

type DataElemDescText = {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  lineSpacing?: number;
  fontWeight?: 'bold' | '';
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';
  bgColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textShadowBlur?: number;
} & DataElemBoxDesc;

type DataElemDescCircle = {
  bgColor: string;
} & DataElemBoxDesc;

type DataElemDescImage = {
  src: string;
} & DataElemDescBase;

type DataElemDescSVG = {
  svg: string;
};

type DataElemDescHTML = {
  html: string;
  width: number;
  height: number;
};

// type DataElemDescPaint = PaintData

export {
  DataElementAttrs,
  DataElemDescText,
  DataElemDescRect,
  DataElemDescCircle,
  DataElemDescImage,
  DataElemDescSVG,
  DataElemDescHTML,
  DataElemDesc,
  DataElemType,
  DataElement,
  DataElementBase
};
