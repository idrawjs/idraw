import type { DefaultElementDetailConfig } from '@idraw/types';

export function getDefaultElementDetailConfig(): DefaultElementDetailConfig {
  const config: DefaultElementDetailConfig = {
    boxSizing: 'center-line',
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: '#000000',
    borderRadius: 0,
    borderDash: [],
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    opacity: 1,
    color: '#000000',
    textAlign: 'left',
    verticalAlign: 'top',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'sans-serif',
    fontWeight: 400
  };
  return config;
}
