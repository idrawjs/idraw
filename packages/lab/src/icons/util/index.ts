import type { CSSProperties } from 'react';
import { createPrefixName } from '../../css';

const modName = 'icon';

const prefixName = createPrefixName(modName);

export const iconClassName = prefixName();

export interface IconProps {
  className?: string;
  style?: CSSProperties;
}
