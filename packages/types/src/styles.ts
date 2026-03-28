import type { HTMLCSSProps } from './dom';

// Allow responsive values: array, breakpoint object, or direct value
type ResponsiveStyleValue<T> = T | null | Array<T | null> | { [key: string]: T | null };

// Allow value as a function (receives the theme)
type SystemValue<T> = ResponsiveStyleValue<T>;

// Base CSS properties type (supports theme function & responsive)
type StylesBase = {
  [K in keyof HTMLCSSProps]?: SystemValue<HTMLCSSProps[K]>;
};

// Support nested selectors (pseudo-classes, child selectors, media queries)
export type StylesProps = StylesBase & {
  [selector: string]:
    | SystemValue<HTMLCSSProps[keyof HTMLCSSProps]> // Simple property value
    | StylesProps; // Recursive nesting
};
