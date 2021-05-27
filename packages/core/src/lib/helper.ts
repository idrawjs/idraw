import {
  TypeData,
  TypeHelper,
  TypeHelperConfig,
  TypeHelperCreateOpts,
  TypeElemDesc
} from '@idraw/types';

export class Helper implements TypeHelper {

  constructor() {}

  createConfig<T extends keyof TypeElemDesc>(
    data: TypeData,
    opts: TypeHelperCreateOpts ): TypeHelperConfig<T> {
    const config = {
      elementMap: {}
    }
    
    return config
  } 
}