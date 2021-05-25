function parsePrototype (data: any) {
  const typeStr = Object.prototype.toString.call(data) || '';
  const result = typeStr.replace(/(\[object|\])/ig, '').trim();
  return result;
};
const istype = {

  type(data: any, lowerCase?: boolean) {
    let result = parsePrototype(data);
    return lowerCase === true ? result.toLocaleLowerCase() : result;
  },

  array (data: any) {
    return parsePrototype(data) === 'Array';
  },

  json (data: any) {
    return parsePrototype(data) === 'Object';
  },

  function (data: any) {
    return parsePrototype(data) === 'Function';
  },

  asyncFunction (data: any) {
    return parsePrototype(data) === 'AsyncFunction';
  },

  string (data: any) {
    return parsePrototype(data) === 'String';
  },

  number (data: any) {
    return parsePrototype(data) === 'Number';
  },

  undefined (data: any) {
    return parsePrototype(data) === 'Undefined';
  },

  null (data: any) {
    return parsePrototype(data) === 'Null';
  },

  promise (data: any) {
    return parsePrototype(data) === 'Promise';
  },

  nodeList (data: any) {
    return parsePrototype(data) === 'NodeList';
  },

  imageData(data: any) {
    return parsePrototype(data) === 'ImageData';
  }
  
};

export default istype;