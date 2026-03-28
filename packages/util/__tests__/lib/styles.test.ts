import { parseStyles, injectStyles } from '@idraw/util';
import type { StylesProps } from '@idraw/types';

// import { parseStyles, injectStyles, StylesProps } from './styleUtils';

describe('parseStyles', () => {
  it('should convert simple style object to CSS string', () => {
    const styles: StylesProps = {
      color: 'red',
      backgroundColor: 'blue',
    };
    const css = parseStyles(styles, '.test');
    expect(css).toBe('.test { color: red; background-color: blue; }');
  });

  it('should handle nested pseudo-classes', () => {
    const styles: StylesProps = {
      color: 'red',
      '&:hover': {
        color: 'white',
      },
    };
    const css = parseStyles(styles, '.btn');
    expect(css).toContain('.btn { color: red; }');
    expect(css).toContain('.btn:hover { color: white; }');
  });

  it('should handle child selectors', () => {
    const styles: StylesProps = {
      '.child': {
        fontSize: '12px',
      },
    };
    const css = parseStyles(styles, '.parent');
    expect(css).toContain('.parent .child { font-size: 12px; }');
  });

  it('should handle media queries', () => {
    const styles: StylesProps = {
      '@media (max-width:600px)': {
        color: 'green',
      },
    };
    const css = parseStyles(styles, '.responsive');
    expect(css).toContain('@media (max-width:600px) { .responsive { color: green; } }');
  });
});

describe('injectStyles', () => {
  beforeEach(() => {
    // Mock adoptedStyleSheets support
    (document as any).adoptedStyleSheets = [];
    (global as any).CSSStyleSheet = class {
      cssText = '';
      replaceSync(text: string) {
        this.cssText = text;
      }
    };
  });

  it('should inject style and return className', () => {
    const styles: StylesProps = {
      color: 'red',
      backgroundColor: 'blue',
    };

    injectStyles({ styles, rootClassName: 'btn' });

    // Ensure adoptedStyleSheets has one item
    expect((document as any).adoptedStyleSheets.length).toBe(1);

    // Check CSS text content
    const sheet = (document as any).adoptedStyleSheets[0];
    expect(sheet.cssText).toContain('.btn { color: red; background-color: blue; }');
  });

  it('should append multiple sheets without overwriting', () => {
    injectStyles({ styles: { color: 'red' }, rootClassName: 'c1' });
    injectStyles({ styles: { color: 'blue' }, rootClassName: 'c2' });

    expect((document as any).adoptedStyleSheets.length).toBe(2);
  });
});
