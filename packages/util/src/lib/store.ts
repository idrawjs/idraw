import { deepClone } from './data';

export class Store<T extends Record<string | symbol, any> = Record<string | symbol, any>> {
  #temp: T;
  #backUpDefaultStorage: T;

  constructor(opts: { defaultStorage: T }) {
    this.#backUpDefaultStorage = deepClone(opts.defaultStorage);
    this.#temp = this.#createTempStorage();
  }

  set<K extends keyof T>(name: K, value: T[K]) {
    this.#temp[name] = value;
  }

  get<K extends keyof T>(name: K): T[K] {
    return this.#temp[name];
  }

  getSnapshot(opts?: { deepClone?: boolean }): T {
    if (opts?.deepClone === true) {
      return deepClone(this.#temp);
    }
    return { ...this.#temp };
  }

  clear() {
    this.#temp = this.#createTempStorage();
  }

  destroy() {
    this.#temp = null as any;
  }

  #createTempStorage() {
    return deepClone(this.#backUpDefaultStorage);
  }
}
