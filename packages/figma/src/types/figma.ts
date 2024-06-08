// https://www.figma.com/developers/api#node-types

export type FigmaNodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'ROUNDED_RECTANGLE'
  | 'ELLIPSE'
  | 'TEXT'
  | 'VECTOR'
  | 'REGULAR_POLYGON'
  | 'LINE'
  | 'STAR'
  | 'SYMBOL'
  | 'INSTANCE'
  | 'BOOLEAN_OPERATION';

export type FigmaNode<T extends FigmaNodeType = 'CANVAS'> = FigmaNodeTypeMap[T];

export type FigmaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type FigmaSize = {
  x: number;
  y: number;
};

export type FigmaObject = {
  nodeChanges: FigmaNode[];
};

export type FigmaNodeMap = {
  [id: string]: FigmaNode;
};

export type FigmaNodeTypeMap = {
  DOCUMENT: FigmaDocumentNode;
  CANVAS: FigmaCanvasNode;
  FRAME: FigmaFrameNode;
  ROUNDED_RECTANGLE: FigmaRoundedRectangleNode;
  ELLIPSE: FigmaRoundedEllipseNode;
  TEXT: FigmaTextNode;
  VECTOR: FigmaVectorNode;
  REGULAR_POLYGON: FigmaRegularPolygonNode;
  LINE: FigmaLineNode;
  STAR: FigmaStarNode;
  SYMBOL: FigmaSymbolNode;
  INSTANCE: FigmaInstanceNode;
  BOOLEAN_OPERATION: FigmaBooleanOperationNode;
};

export type FigmaGUID = {
  localID: number;
  sessionID: number;
};

export type FigmaTransform = {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
};

export type FigmaNodeBase = {
  opacity: number;
  name: string;
  guid: FigmaGUID;
  parentIndex?: {
    guid: FigmaGUID;
    position?: string;
  };
  transform: FigmaTransform;
  visible: boolean;
  locked: boolean;
  size: FigmaSize;
  overrideKey?: FigmaGUID;
  effects: FigmaEffect[];
  mask?: boolean;
  maskType?: string; // "ALPHA"
};

export type FigmaEffect = {
  blendMode: string; // 'NORMAL'
  color: FigmaColor;
  offset: { x: number; y: number };
  radius: number;
  showShadowBehindNode: true;
  spread: number;
  type: string; // 'DROP_SHADOW'
  visible: boolean;
};

export type FigmaPaint = FigmaFillPaint | FigmaStrokePaint;

export type FigmaFillPaint = FigmaFillPaintSolid | FigmaFillPaintGradientRadial | FigmaFillPaintGradientLinear | FigmaFillPaintImage;

export type FigmaFillPaintSolid = {
  blendMode: string;
  opacity: number;
  type: 'SOLID';
  visible: boolean;
  color: FigmaColor;
};

export type FigmaFillPaintGradientRadial = {
  blendMode: string;
  opacity: number;
  type: 'GRADIENT_RADIAL';
  visible: boolean;
  transform: FigmaTransform;
  stops: Array<{
    color: FigmaColor;
    position: number;
  }>;
  stopsVar: Array<{
    color: FigmaColor;
    colorVar: {
      dataType: string; // 'COLOR';
      resolvedDataType: string; // 'COLOR';
      position: number;
      value: {
        colorValue: FigmaColor;
      };
    };
  }>;
};

export type FigmaFillPaintGradientLinear = {
  blendMode: string;
  opacity: number;
  type: 'GRADIENT_LINEAR';
  visible: boolean;
  transform: FigmaTransform;
  stops: Array<{
    color: FigmaColor;
    position: number;
  }>;
  stopsVar: Array<{
    color: FigmaColor;
    colorVar: {
      dataType: string; // 'COLOR';
      resolvedDataType: string; // 'COLOR';
      position: number;
      value: {
        colorValue: FigmaColor;
      };
    };
  }>;
};

export type FigmaFillPaintImage = {
  blendMode: string; // 'NORMAL';
  opacity: number;
  type: 'IMAGE';
  image: {
    hash: Uint8Array;
    name: string;
  };
  imageScaleMode: string; //'FILL';
  imageShouldColorManage: boolean;
  imageThumbnail: {
    hash: Uint8Array;
    name: string;
  };
  originalImageHeight: number;
  originalImageWidth: number;
  rotation: number;
  scale: number;
  transform: FigmaTransform;
  visible: boolean;
  color: FigmaColor;
};

export type FigmaFillGeometryItem = {
  commandsBlob?: Uint8Array;
  commands: Array<string | number>;
  styleID: number;
  windingRule: string; // 'NONZERO' | 'ODD'
};

export type FigmaNodeFillBase = {
  fillGeometry: Array<FigmaFillGeometryItem>;
  fillPaints: Array<FigmaFillPaintSolid | FigmaFillPaintImage>;
};

export type FigmaStrokeGeometryItem = {
  commandsBlob?: Uint8Array;
  commands: Array<string | number>;
  styleID: number;
  windingRule: string; // 'NONZERO';
};

export type FigmaStrokePaint = {
  blendMode: string; // 'NORMAL';
  opacity: number;
  type: string; // 'SOLID';
  visible: boolean;
  color: FigmaColor;
};

export type FigmaNodeStrokeBase = {
  strokeAlign: 'CENTER' | 'OUTSIDE' | 'INSIDE';
  strokeCap: string; // 'NONE';
  strokeGeometry: Array<FigmaStrokeGeometryItem>;
  strokeJoin: string; // 'MITER';
  strokePaints: Array<FigmaStrokePaint>;
  strokeWeight: number;
};

export type FigmaNodeCornerBase = {
  cornerRadius: number;
  rectangleCornerRadiiIndependent: boolean;
  rectangleBottomLeftCornerRadius: number;
  rectangleBottomRightCornerRadius: number;
  rectangleTopLeftCornerRadius: number;
  rectangleTopRightCornerRadius: number;
};

export type FigmaNodeBoxBorderBase = FigmaNodeStrokeBase &
  FigmaNodeCornerBase & {
    borderStrokeWeightsIndependent?: boolean;
    borderBottomWeight?: number;
    borderLeftWeight?: number;
    borderRightWeight?: number;
    borderTopWeight?: number;
    dashPattern: number[];
  };

export type FigmaDocumentNode = FigmaNodeBase & {
  type: 'DOCUMENT';
  children: FigmaNode[];
};

export type FigmaCanvasNode = FigmaNodeBase &
  FigmaNodeFillBase &
  FigmaNodeStrokeBase & {
    type: 'CANVAS';
    backgroundColor: FigmaColor;
    children?: FigmaNode[];
    internalOnly?: boolean;
  };

export type FigmaBooleanOperationNode = FigmaNodeBase &
  FigmaNodeFillBase &
  FigmaNodeStrokeBase & {
    type: 'BOOLEAN_OPERATION';
    backgroundColor: FigmaColor;
    children?: FigmaNode[];
    internalOnly?: boolean;
  };

export type FigmaSymbolNode = FigmaNodeBase &
  FigmaNodeFillBase &
  FigmaNodeStrokeBase & {
    type: 'SYMBOL';
    backgroundColor: FigmaColor;
    children?: FigmaNode[];
  };

// TODO
export type FigmaDerivedSymbolDataItem = Partial<FigmaNode> & {
  guidPath: {
    guids: Array<FigmaGUID>;
  };
};

export type FigmaDerivedSymbolData = Array<FigmaDerivedSymbolDataItem>;

export type FigmaSymbolOverrideItem = {
  overriddenSymbolID?: FigmaGUID;
  guidPath: {
    guids: Array<FigmaGUID>;
  };
} & Partial<Omit<FigmaNode, 'guidPath'>>;

export type FigmaInstanceNode = FigmaNodeBase &
  FigmaNodeFillBase &
  FigmaNodeStrokeBase & {
    type: 'INSTANCE';
    backgroundColor: FigmaColor;
    derivedSymbolData: FigmaDerivedSymbolData;
    symbolData: {
      symbolID: FigmaGUID;
      symbolOverrides: Array<FigmaSymbolOverrideItem>;
    };
    symbolDescription: string;
  };

export type FigmaFrameNode = FigmaNodeBase &
  FigmaNodeFillBase & {
    type: 'FRAME';
    children?: FigmaNode[];
    frameMaskDisabled?: boolean;
  };

export type FigmaRoundedRectangleNode = FigmaNodeBase &
  FigmaNodeBoxBorderBase &
  FigmaNodeFillBase & {
    type: 'ROUNDED_RECTANGLE';
  };

export type FigmaRoundedEllipseNode = FigmaNodeBase &
  FigmaNodeBoxBorderBase &
  FigmaNodeFillBase & {
    type: 'ELLIPSE';
  };

export type FigmaTextNode = FigmaNodeBase &
  FigmaNodeBoxBorderBase &
  FigmaNodeFillBase & {
    type: 'TEXT';
    textAlignHorizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
    textAutoResize: string; // 'NONE';
    textBidiVersion: number;
    textTracking: number;
    textUserLayoutVersion: number;
    textCase?: 'UPPER' | 'LOWER';
    textData: {
      characters: string;
      layoutSize: FigmaSize;
      fontMetaData: Array<{
        fontDigest: Uint8Array;
        fontLineHeight: number;
        fontStyle: string; // NORMAL
        fontWeight: number;
        key: {
          family: string;
          style: string;
        };
      }>;
      glyphs: Array<{
        advance: number;
        commandsBlob: number;
        firstCharacter: number;
        fontSize: number;
        position: { x: number; y: number };
      }>;
    };
    fontName: {
      family: string;
      postscript: string;
      style: string;
    };
    fontSize: number;
    fontVariantCaps: string;
    fontVariantCommonLigatures: boolean;
    fontVariantContextualLigatures: boolean;
    fontVariantDiscretionaryLigatures: boolean;
    fontVariantHistoricalLigatures: boolean;
    fontVariantNumericFigure: string;
    fontVariantNumericFraction: string;
    fontVariantNumericSpacing: string;
    fontVariantOrdinal: boolean;
    fontVariantPosition: string;
    fontVariantSlashedZero: boolean;
    fontVariations: any[]; // TODO
    fontVersion: string;
    lineHeight: {
      units: string;
      value: number;
    };
  };

export type FigmaRegularPolygonNode = FigmaNodeBase &
  FigmaNodeStrokeBase &
  FigmaNodeFillBase & {
    type: 'REGULAR_POLYGON';
  };

export type FigmaVectorNode = FigmaNodeBase &
  FigmaNodeStrokeBase &
  FigmaNodeFillBase & {
    type: 'VECTOR';
    vectorData: {
      normalizedSize: FigmaSize;
      styleOverrideTable: Array<{
        handleMirroring: string; // 'ANGLE_AND_LENGTH';
        styleID: number;
      }>;
      vectorNetwork: {
        regions: any[]; // TODO
        segments: Array<{
          start: {
            dx: number;
            dy: number;
            vertex: number;
          };
          end: {
            dx: number;
            dy: number;
            vertex: number;
          };
          styleID: number;
        }>;
        vertices: Array<{
          styleID: number;
          x: number;
          y: number;
        }>;
      };
    };
  };

export type FigmaLineNode = FigmaNodeBase &
  FigmaNodeStrokeBase &
  FigmaNodeFillBase & {
    type: 'LINE';
  };

export type FigmaStarNode = FigmaNodeBase &
  FigmaNodeStrokeBase &
  FigmaNodeFillBase & {
    type: 'STAR';
  };

export interface FigmaCanvasFigObject {
  version: number;
  root: FigmaNode<'DOCUMENT'>;
  blobs: Array<{
    bytes: Uint8Array;
  }>;
  backupNodeList: FigmaNode[];
  backupNodeMap: Record<string, FigmaNode>;
}

export type FigmaMap = {
  [key: string]: Uint8Array;
} & {
  'canvas.fig': FigmaCanvasFigObject;
  'thumbnail.png': Uint8Array;
  'meta.json': any;
  'images/': Uint8Array;
};

export type FigmaParseOptions<T extends FigmaNodeType = 'CANVAS'> = {
  figmaMap: FigmaMap;
  backupNodeMap: Record<string, FigmaNode>;
  instanceNodeMap: Record<string, FigmaNode>;
  overrideNodeMap?: Record<string, Partial<FigmaNode<T>>>;
  overrideProperties?: Partial<FigmaNode<T>>;
};
