import type { MiddlewareInfoStyle } from '@idraw/types';

const infoBackground = '#1973bac6';
const infoTextColor = '#ffffff';

export const infoFontSize = 10;
export const infoLineHeight = 16;

export const MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE = '@middleware/internal-event/show-info-angle';

export const defaltStyle: MiddlewareInfoStyle = {
  textBackground: infoBackground,
  textColor: infoTextColor
};
