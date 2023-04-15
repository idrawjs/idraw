import { deepClone } from './data';

export class Store<T extends Record<string, any>> {
  private _temp: T;
  private _backUpDefaultStorage: T;

  constructor(opts: { defaultStorage: T }) {
    this._backUpDefaultStorage = deepClone(opts.defaultStorage);
    this._temp = this._createTempStorage();
  }

  set<K extends keyof T>(name: K, value: T[K]) {
    this._temp[name] = value;
  }

  get<K extends keyof T>(name: K): T[K] {
    return this._temp[name];
  }

  getSnapshot(): T {
    return deepClone(this._temp);
  }

  clear() {
    this._temp = this._createTempStorage();
  }

  private _createTempStorage() {
    return deepClone(this._backUpDefaultStorage);
  }
}
