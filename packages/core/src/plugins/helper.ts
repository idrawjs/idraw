import {
  InterfaceHelperPlugin, TypeHelperPluginEventDetail,
  TypeHelperPluginEventResult,
} from '@idraw/types';
import { createUUID } from '@idraw/util';


export class HelperPlugin implements Required<InterfaceHelperPlugin> {

  readonly name: string = 'helper-plugin';

  readonly uuid: string;

  constructor() {
    // TODO
    this.uuid = createUUID();
  }

  onHover(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    if (detail.controller === null) {
      
    }
  }

  onPoint(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    
  }

  onClick(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    
  }

  onMoveStart(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    
  }

  onMove(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    

  }

  onMoveEnd(detail: TypeHelperPluginEventDetail): void | TypeHelperPluginEventResult {
    
  }
  
}