type TypeConfig = {
  elementWrapper?: {
    color?: string,
    controllerSize?: number,
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
    controllerSize: number,
    lineWidth: number,
    lineDash: number[],
  },
}

export {
  TypeConfig,
  TypeConfigStrict
};