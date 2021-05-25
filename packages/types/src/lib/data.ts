

type ElementsDescMap = {
  text: {
    size: number;
  },
  rect: {
    color: string;
  },
  circle: {
    color: string;
    r: number;
    x: number;
    y: number;
  },
  image: {
    src: number;
  },
  paint: {
    
  }
}

type TypeDataElement<T extends keyof ElementsDescMap> = {
  uuid?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: T;
  desc: ElementsDescMap[T];
}

type TypeData = {
  elements: TypeDataElement<keyof ElementsDescMap>[]
  selectedElements?: string[] // uuids
}

export {
  TypeDataElement,
  TypeData
}