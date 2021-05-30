type TypeConfig = {
  elementWrapper?: {
    color?: string,
    dotSize?: number,
    lineWidth?: number,
    lineDash?: number[],
  }
}

type TypeConfigStrict = TypeConfig & {
  elementWrapper: {
    color: string,
    dotSize: number,
    lineWidth: number,
    lineDash: number[],
  }
}

export {
  TypeConfig,
  TypeConfigStrict
};