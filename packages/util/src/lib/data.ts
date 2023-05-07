export function deepClone(target: any): any {
  function _clone(t: any) {
    const type = is(t);
    if (['Null', 'Number', 'String', 'Boolean', 'Undefined'].indexOf(type) >= 0) {
      return t;
    } else if (type === 'Array') {
      const arr: any[] = [];
      t.forEach((item: any) => {
        arr.push(_clone(item));
      });
      return arr;
    } else if (type === 'Object') {
      const obj: { [key: string]: any } = {};
      const keys = Object.keys(t);
      keys.forEach((key) => {
        obj[key] = _clone(t[key]);
      });
      return obj;
    }
  }
  return _clone(target);
}

function is(data: any): string {
  return Object.prototype.toString
    .call(data)
    .replace(/[\]|\[]{1,1}/gi, '')
    .split(' ')[1];
}
