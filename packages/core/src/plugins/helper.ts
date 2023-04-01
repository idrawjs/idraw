import {
  InterfaceHelperPlugin,
  HelperPluginEventDetail,
  HelperPluginEventResult
} from '@idraw/types';
import { createUUID } from '@idraw/util';

export class HelperPlugin implements Required<InterfaceHelperPlugin> {
  readonly name: string = 'helper-plugin';

  readonly uuid: string;

  constructor() {
    // TODO
    this.uuid = createUUID();
  }

  onHover(detail: HelperPluginEventDetail): void | HelperPluginEventResult {
    if (detail.controller === null) {
    }
  }

  onPoint(detail: HelperPluginEventDetail): void | HelperPluginEventResult {}

  onClick(detail: HelperPluginEventDetail): void | HelperPluginEventResult {}

  onMoveStart(
    detail: HelperPluginEventDetail
  ): void | HelperPluginEventResult {}

  onMove(detail: HelperPluginEventDetail): void | HelperPluginEventResult {}

  onMoveEnd(detail: HelperPluginEventDetail): void | HelperPluginEventResult {}
}
