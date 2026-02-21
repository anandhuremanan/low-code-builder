import { type CustomStyle } from '../builder/types';

const normalizeClassToken = (className: string): string => {
  return className.trim().replace(/^\./, '').split(/\s+/)[0] || '';
};

const looksLikeFullCssRule = (css: string): boolean => {
  return css.includes('{') && css.includes('}');
};

const normalizeDeclarations = (css: string): string => {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
};

const buildCssRule = (style: CustomStyle): string => {
  const classToken = normalizeClassToken(style.className);
  const css = style.css.trim();
  if (!classToken || !css) return '';

  if (looksLikeFullCssRule(css)) {
    return css;
  }

  // Duplicate class selector once to improve specificity against component defaults.
  return `.${classToken}.${classToken} { ${normalizeDeclarations(css)} }`;
};

export const compileCustomStylesCss = (styles: CustomStyle[]): string => {
  return styles
    .map(buildCssRule)
    .filter(Boolean)
    .join('\n\n');
};

