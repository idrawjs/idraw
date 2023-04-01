type IsTypeUtil = {
  x: (value: any) => boolean;
  y: (value: any) => boolean;
  w: (value: any) => boolean;
  h: (value: any) => boolean;
  angle: (value: any) => boolean;
  number: (value: any) => boolean;
  borderWidth: (value: any) => boolean;
  borderRadius: (value: any) => boolean;
  color: (value: any) => boolean;
  imageSrc: (value: any) => boolean;
  imageURL: (value: any) => boolean;
  imageBase64: (value: any) => boolean;
  svg: (value: any) => boolean;
  html: (value: any) => boolean;
  text: (value: any) => boolean;
  fontSize: (value: any) => boolean;
  fontWeight: (value: any) => boolean;
  lineHeight: (value: any) => boolean;
  textAlign: (value: any) => boolean;
  fontFamily: (value: any) => boolean;
  strokeWidth: (value: any) => boolean;
};

type CheckTypeUtil = {
  attrs: (value: any) => boolean;
  rectDesc: (value: any) => boolean;
  circleDesc: (value: any) => boolean;
  imageDesc: (value: any) => boolean;
  svgDesc: (value: any) => boolean;
  htmlDesc: (value: any) => boolean;
  textDesc: (value: any) => boolean;
};

export { IsTypeUtil, CheckTypeUtil };
