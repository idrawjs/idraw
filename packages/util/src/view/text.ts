const baseFontFamilyList = ['-apple-system', '"system-ui"', ' "Segoe UI"', ' Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', ' sans-serif'];

export function enhanceFontFamliy(fontFamily?: string): string {
  return [fontFamily, ...baseFontFamilyList].join(', ');
}
