export interface HTMLCSSProps {
  // color
  color?: string;
  backgroundColor?: string;
  stroke?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  outlineColor?: string;
  textShadow?: string;

  // size
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  padding?: string | number;
  margin?: string | number;
  cornerRadius?: string | number;
  fontSize?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;

  // layout
  display?: 'block' | 'inline' | 'inline-module' | 'flex' | 'inline-flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: string | number;
  flex?: string | number;
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;

  // border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  strokeWidth?: string | number;
  borderStyle?: string;

  // bg
  background?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';

  // text
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textStroke?: string;
  '-webkit-text-stroke'?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';

  // animation
  transition?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  animation?: string;

  // other
  opacity?: string | number;
  cursor?: string;
  boxSizing?: 'content-box' | 'border-box' | 'inherit';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  visibility?: 'visible' | 'hidden';
  clip?: string;
  boxShadow?: string;
  outline?: string;
  transform?: string;
  transformOrigin?: string;
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';

  wordBreak?: string;
}

export type HTMLProps = {
  // Global attributes (applicable to all HTML materials)
  id?: string; // Specifies a unique id for the material
  className?: string; // Specifies one or more class names
  style?: HTMLCSSProps; // Inline CSS styles
  title?: string; // Tooltip text displayed when hovering over the material
  hidden?: boolean; // Specifies whether the material is hidden
  tabindex?: number; // Specifies the tab order of the material
  draggable?: boolean; // Specifies whether the material is draggable
  contenteditable?: boolean | 'true' | 'false'; // Specifies whether the content is editable
  spellcheck?: boolean | 'true' | 'false'; // Specifies whether spellchecking is enabled
  lang?: string; // Specifies the language of the material's content
  dir?: 'ltr' | 'rtl' | 'auto'; // Specifies the text direction
  accesskey?: string; // Specifies a shortcut key to activate or focus the material

  // Attributes specific to certain HTML materials
  href?: string; // URL for <a>, <link>, <base>
  src?: string; // URL for <img>, <audio>, <video>, etc.
  alt?: string; // Alternative text for <img>
  type?: string; // Specifies the type of material, e.g., <input>, <button>
  // value?: string | number; // Value for <input>, <button>, etc.
  disabled?: boolean; // Disables the material, e.g., <input>, <button>
  checked?: boolean; // Specifies if <input type="checkbox"> or <radio> is checked

  // Custom data-* attributes (e.g., data-user-id, data-role)
  [key: `data-${string}`]: string | number | undefined;

  // Allow any additional custom attributes
  [key: string]: any;
};
