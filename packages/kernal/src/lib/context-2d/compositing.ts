import { Context2dBase } from './base';


type Constructor<T = Context2dBase> = new (...args: any[]) => T;

export function mixinsCompositing<TBase extends Constructor>(Base: TBase) {

  return class extends Base {
    
    get globalAlpha (): number | undefined {
      return this.$getAttr('globalAlpha');
    }
  
    set globalAlpha(value: number | undefined) {
      this.$setAttr('globalAlpha', value);
      this.$pushRecord({
        name: 'globalAlpha',
        type: 'attr',
        args: [value]
      })
    }
  }
  
}