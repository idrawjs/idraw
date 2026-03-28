import type { MiddlewareInfoStyles, MiddlewareInfoConfig } from '@idraw/types';
import { getMiddlewareValidStyles } from '@idraw/util';

const infoBackground = '#1973bac6';
const infoTextColor = '#ffffff';

export const infoFontSize = 10;
export const infoLineHeight = 16;

export const MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE = '@middleware/internal-event/show-info-angle';

export const defaltStyle: MiddlewareInfoStyles = {
  textBackground: infoBackground,
  textColor: infoTextColor,
};

export function getMiddlewareInfoStyles<C = MiddlewareInfoConfig, S = MiddlewareInfoStyles>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, ['textBackground', 'textColor']);
  return styles;
}
