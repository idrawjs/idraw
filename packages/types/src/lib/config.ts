type IDrawConfig = {
  elementWrapper?: {
    color?: string;
    controllerSize?: number;
    lineWidth?: number;
    lineDash?: number[];
  };
  scrollWrapper?: {
    use?: boolean;
    color?: string;
    width?: number;
    showBackground?: boolean;
  };
};

type IDrawConfigStrict = IDrawConfig & {
  elementWrapper: {
    color: string;
    lockColor: string;
    controllerSize: number;
    lineWidth: number;
    lineDash: number[];
  };
};

export { IDrawConfig, IDrawConfigStrict };
