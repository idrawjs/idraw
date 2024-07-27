import type { RecursivePartial } from '@idraw/types';
import { deepClone } from './data';

export class Store<
  T extends Record<string | symbol, any> = Record<string | symbol, any>,
  S extends Record<string | symbol, any> = Record<string | symbol, any>
> {
  #temp: T;
  #backUpDefaultStorage: T;
  #static: RecursivePartial<S>;

  constructor(opts: { defaultStorage: T; defaultStatic?: S }) {
    this.#backUpDefaultStorage = deepClone(opts.defaultStorage);
    this.#temp = this.#createTempStorage();
    this.#static = opts.defaultStatic || {};
  }

  set<K extends keyof T>(name: K, value: T[K]) {
    this.#temp[name] = value;
  }

  get<K extends keyof T>(name: K): T[K] {
    return this.#temp[name];
  }

  setStatic<K extends keyof S>(name: K, value: S[K]) {
    this.#static[name] = value;
  }

  getStatic<K extends keyof S>(name: K): S[K] | undefined {
    return this.#static[name] as S[K] | undefined;
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
    this.#static = null as any;
  }

  #createTempStorage() {
    return deepClone(this.#backUpDefaultStorage);
  }
}
