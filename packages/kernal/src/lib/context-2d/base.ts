// const _records = Symbol('_records');
// const _attrs = Symbol('_attrs');

const _records = '_records';
const _attrs = '_attrs';

export type Context2dRecord = {
  name: string,
  type: 'attr' | 'method',
  args: any[]
}

export type Context2dAttr = {
  globalAlpha?: number;
}


class Storage {
  
  [_records]: Context2dRecord[] = [];
  [_attrs]: Context2dAttr = {};

  setAttr(name: keyof Context2dAttr, value: any) {
    this[_attrs][name] = value;
  }

  getAttr(name: keyof Context2dAttr): any {
    return this[_attrs][name];
  }

  pushRecord(record: Context2dRecord) {
    this[_records].push(record);
  }

  getAllRecords(): Context2dRecord[] {
    return this[_records];
  }

  getAllAttrs() {
    return this[_attrs];
  }
}

export class Context2dBase {

  __storage__: Storage = new Storage()

  $setAttr(name: keyof Context2dAttr, value: any) {
    this.__storage__.setAttr(name, value)
  }

  $getAttr(name: keyof Context2dAttr): any {
    return this.__storage__.getAttr(name);
  }

  $pushRecord(record: Context2dRecord) {
    this.__storage__.pushRecord(record);
  }

  $getAllRecords(): Context2dRecord[] {
    return this.__storage__.getAllRecords();
  }

  $getAllAttrs() {
    return this.__storage__.getAllAttrs();
  }
}



