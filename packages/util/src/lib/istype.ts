function parsePrototype(data: any): string {
  const typeStr = Object.prototype.toString.call(data) || '';
  const result = typeStr.replace(/(\[object|\])/gi, '').trim();
  return result;
}
export const istype = {
  type(data: any, lowerCase?: boolean): string {
    const result = parsePrototype(data);
    return lowerCase === true ? result.toLocaleLowerCase() : result;
  },

  array(data: any): boolean {
    return parsePrototype(data) === 'Array';
  },

  json(data: any): boolean {
    return parsePrototype(data) === 'Object';
  },

  function(data: any): boolean {
    return parsePrototype(data) === 'Function';
  },

  asyncFunction(data: any): boolean {
    return parsePrototype(data) === 'AsyncFunction';
  },

  boolean(data: any): boolean {
    return parsePrototype(data) === 'Boolean';
  },

  string(data: any): boolean {
    return parsePrototype(data) === 'String';
  },

  number(data: any): boolean {
    return parsePrototype(data) === 'Number';
  },

  undefined(data: any): boolean {
    return parsePrototype(data) === 'Undefined';
  },

  null(data: any): boolean {
    return parsePrototype(data) === 'Null';
  },

  promise(data: any): boolean {
    return parsePrototype(data) === 'Promise';
  }

  // nodeList (data: any): boolean {
  //   return parsePrototype(data) === 'NodeList';
  // },

  // imageData(data: any): boolean {
  //   return parsePrototype(data) === 'ImageData';
  // }
};
