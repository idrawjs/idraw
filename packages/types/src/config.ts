import type { MaterialBaseAttributes, MaterialTextAttributes, MaterialImageAttributes } from './material';

export type DefaultMaterialAttributes = Required<
  Omit<
    MaterialBaseAttributes,
    'name' | 'transform' | 'cornerRadius'
    // | 'shadowOffsetX'
    // | 'shadowOffsetY'
    // | 'shadowBlur'
    // | 'shadowColor'
    // | 'opacity'
    // | 'boxSizing'
    // | 'color'
    // | 'textAlign'
    // | 'verticalAlign'
    // | 'fontSize'
    // | 'lineHeight'
    // | 'fontFamily'
    // | 'fontWeight'
    // | 'minInlineSize'
    // | 'wordBreak'
    // | 'overflow'
  >
> &
  Pick<Required<MaterialTextAttributes>, 'text'> &
  Pick<Required<MaterialImageAttributes>, 'href'>;
