import { Core, MiddlewareInfo, MiddlewareLayoutSelector, MiddlewareRuler, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { Store } from '@idraw/util';
import type { IDrawSettings, IDrawStorage } from '@idraw/types';
import type { IDrawEvent } from '../event';

export function changeStyles(styles: Required<IDrawSettings>['styles'], core: Core<IDrawEvent>, store: Store<IDrawStorage>) {
  const { selector, info, ruler, scroller, layoutSelector } = styles;
  const middlewareStyles = store.get('middlewareStyles');
  if (selector) {
    core.resetMiddlewareConfig(MiddlewareSelector, selector);
    middlewareStyles.selector = { ...middlewareStyles.selector, ...selector };
  }
  if (info) {
    core.resetMiddlewareConfig(MiddlewareInfo, info);
    middlewareStyles.info = { ...middlewareStyles.info, ...info };
  }
  if (ruler) {
    core.resetMiddlewareConfig(MiddlewareRuler, ruler);
    middlewareStyles.ruler = { ...middlewareStyles.ruler, ...ruler };
  }
  if (scroller) {
    core.resetMiddlewareConfig(MiddlewareScroller, scroller);
    middlewareStyles.scroller = { ...middlewareStyles.scroller, ...scroller };
  }
  if (layoutSelector) {
    core.resetMiddlewareConfig(MiddlewareLayoutSelector, layoutSelector);
    middlewareStyles.layoutSelector = { ...middlewareStyles.layoutSelector, ...layoutSelector };
  }
}
