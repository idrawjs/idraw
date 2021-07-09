type TypeConfig = {
  elementWrapper?: {
    color?: string,
    dotSize?: number,
    lineWidth?: number,
    lineDash?: number[],
  },
  scrollWrapper?: {
    use?: boolean,
    color?: string,
    lineWidth?: number,
  }
}

type TypeConfigStrict = TypeConfig & {
  elementWrapper: {
    color: string,
    lockColor: string,
    dotSize: number,
    lineWidth: number,
    lineDash: number[],
  },
}

export {
  TypeConfig,
  TypeConfigStrict
};