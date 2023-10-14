export interface UtilEventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void): void;
  off<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void): void;
  trigger<K extends keyof T>(eventKey: K, e: T[K]): void;
  has<K extends keyof T>(name: K | string): boolean;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
