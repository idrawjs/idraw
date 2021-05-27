import { TypeData } from './data';
import { TypeElement, TypeElemDesc } from './element';

// type test = {[uuid string]: TypeElement}

type TypeHelperConfig<T extends keyof TypeElemDesc> = {
  elementMap: {[key: string]: TypeElement<T>}
}

type TypeHelperCreateOpts = {
  selectedIndex: number
}

interface TypeHelper {
  createConfig<T extends keyof TypeElemDesc>(
    data: TypeData,
    opts: TypeHelperCreateOpts
  ): TypeHelperConfig<T>;
}

export {
  TypeHelper,
  TypeHelperConfig,
  TypeHelperCreateOpts,
}