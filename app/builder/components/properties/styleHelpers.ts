import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

export const TEXT_SIZE_CLASSES = new Set([
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
    'text-5xl',
    'text-6xl',
    'text-7xl',
    'text-8xl',
    'text-9xl'
]);

export const TEXT_ALIGN_CLASSES = new Set([
    'text-left',
    'text-center',
    'text-right',
    'text-justify',
    'text-start',
    'text-start',
    'text-end'
]);

export const OBJECT_FIT_CLASSES = new Set([
    'object-contain',
    'object-cover',
    'object-fill',
    'object-none',
    'object-scale-down'
]);

export const extractTokenFromClass = (className: string, allowed: Set<string>): string => {
    const tokens = className.split(/\s+/).filter(Boolean);
    return tokens.find((token) => allowed.has(token)) || '';
};

const isPaddingToken = (token: string): boolean => {
    if (!token.startsWith('p')) return false;
    const parts = token.split('-');
    if (parts.length < 2) return false;
    const axis = parts[0];
    return axis === 'p' || axis === 'px' || axis === 'py' || axis === 'pt' || axis === 'pr' || axis === 'pb' || axis === 'pl';
};

const isMarginToken = (token: string): boolean => {
    const normalized = token.startsWith('-') ? token.slice(1) : token;
    if (!normalized.startsWith('m')) return false;
    const parts = normalized.split('-');
    if (parts.length < 2) return false;
    const axis = parts[0];
    return axis === 'm' || axis === 'mx' || axis === 'my' || axis === 'mt' || axis === 'mr' || axis === 'mb' || axis === 'ml';
};

export const replaceTokenInClass = (className: string, allowed: Set<string>, nextToken: string): string => {
    const tokens = className.split(/\s+/).filter(Boolean);
    const filtered = tokens.filter((token) => !allowed.has(token));
    if (!nextToken.trim()) return filtered.join(' ').trim();
    return [...filtered, nextToken.trim()].join(' ').trim();
};

export const extractMarginTokens = (className: string): string => {
    if (!className) return '';
    return className
        .split(/\s+/)
        .filter((token) => isMarginToken(token))
        .join(' ');
};

export const replaceMarginTokens = (className: string, nextMarginValue: string): string => {
    const cleaned = className
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => !isMarginToken(token))
        .join(' ');

    const normalizedMargin = normalizeSpacingInput(nextMarginValue);
    if (!normalizedMargin) return cleaned.trim();
    return twMerge(cleaned, normalizedMargin);
};

export const extractPaddingTokens = (className: string): string => {
    if (!className) return '';
    return className
        .split(/\s+/)
        .filter((token) => isPaddingToken(token))
        .join(' ');
};

export const normalizeSpacingInput = (value: string): string => {
    return value.replace(/,/g, ' ').trim().replace(/\s+/g, ' ');
};

export const replacePaddingTokens = (className: string, nextPaddingValue: string): string => {
    const cleaned = className
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => !isPaddingToken(token))
        .join(' ');

    const normalizedPadding = normalizeSpacingInput(nextPaddingValue);
    if (!normalizedPadding) return cleaned.trim();
    return twMerge(cleaned, normalizedPadding);
};

const spacingTokenToCssValue = (raw: string): string => {
    if (!raw) return '';
    if (raw === 'auto') return 'auto';
    if (raw === 'px') return '1px';
    if (/^-?\d+(\.\d+)?$/.test(raw)) {
        return `${Number(raw) * 0.25}rem`;
    }
    if (raw.startsWith('[') && raw.endsWith(']')) {
        return raw.slice(1, -1);
    }
    return raw;
};

const marginTokenToStyle = (token: string): Record<string, string> => {
    const match = token.trim().match(/^(-)?m([trblxy]?)-(.+)$/);
    if (!match) return {};

    const [, isNegative, axis, rawValue] = match;
    const baseValue = spacingTokenToCssValue(rawValue);
    if (!baseValue) return {};
    const finalValue = isNegative === '-' && baseValue !== 'auto'
        ? (baseValue.startsWith('-') ? baseValue : `-${baseValue}`)
        : baseValue;

    if (axis === '') return { margin: finalValue };
    if (axis === 't') return { marginTop: finalValue };
    if (axis === 'r') return { marginRight: finalValue };
    if (axis === 'b') return { marginBottom: finalValue };
    if (axis === 'l') return { marginLeft: finalValue };
    if (axis === 'x') return { marginLeft: finalValue, marginRight: finalValue };
    if (axis === 'y') return { marginTop: finalValue, marginBottom: finalValue };

    return {};
};

const paddingTokenToStyle = (token: string): Record<string, string> => {
    const match = token.trim().match(/^p([trblxy]?)-(.+)$/);
    if (!match) return {};

    const [, axis, rawValue] = match;
    const value = spacingTokenToCssValue(rawValue);
    if (!value) return {};

    if (axis === '') return { padding: value };
    if (axis === 't') return { paddingTop: value };
    if (axis === 'r') return { paddingRight: value };
    if (axis === 'b') return { paddingBottom: value };
    if (axis === 'l') return { paddingLeft: value };
    if (axis === 'x') return { paddingLeft: value, paddingRight: value };
    if (axis === 'y') return { paddingTop: value, paddingBottom: value };

    return {};
};

export const paddingTokensToStyle = (value: string): Record<string, string> => {
    const tokens = normalizeSpacingInput(value)
        .split(/\s+/)
        .filter((token) => isPaddingToken(token));

    return tokens.reduce<Record<string, string>>((acc, token) => {
        return { ...acc, ...paddingTokenToStyle(token) };
    }, {});
};

export const marginTokensToStyle = (value: string): Record<string, string> => {
    const tokens = normalizeSpacingInput(value)
        .split(/\s+/)
        .filter((token) => isMarginToken(token));

    return tokens.reduce<Record<string, string>>((acc, token) => {
        return { ...acc, ...marginTokenToStyle(token) };
    }, {});
};

const spacingOrArbitraryToCss = (raw: string): string => {
    if (!raw) return '';
    if (raw === 'auto') return 'auto';
    if (raw === 'px') return '1px';
    if (/^-?\d+(\.\d+)?$/.test(raw)) return `${Number(raw) * 0.25}rem`;
    if (raw.includes('/')) {
        const [n, d] = raw.split('/');
        const num = Number(n);
        const den = Number(d);
        if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
            return `${(num / den) * 100}%`;
        }
    }
    if (raw.startsWith('[') && raw.endsWith(']')) return raw.slice(1, -1);
    return raw;
};

export const sizeTokenToStyle = (token: string): Record<string, string> => {
    const match = token.trim().match(/^([wh])-(.+)$/);
    if (!match) return {};
    const [, axis, raw] = match;

    if (raw === 'full') return axis === 'w' ? { width: '100%' } : { height: '100%' };
    if (raw === 'screen') return axis === 'w' ? { width: '100vw' } : { height: '100vh' };

    const cssValue = spacingOrArbitraryToCss(raw);
    if (!cssValue) return {};
    return axis === 'w' ? { width: cssValue } : { height: cssValue };
};

export const isHexColor = (value: string): boolean => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

export const widthTokenToPx = (token: string): string => {
    if (token === 'border') return '1px';
    if (token === 'border-2') return '2px';
    if (token === 'border-4') return '4px';
    if (token === 'border-8') return '8px';
    return '';
};

export const styleTokenToCss = (token: string): string => {
    if (token === 'border-dashed') return 'dashed';
    if (token === 'border-dotted') return 'dotted';
    if (token === 'border-double') return 'double';
    if (token === 'border-none') return 'none';
    return '';
};

export const sideToBorderProp = (
    side: 'all' | 'top' | 'right' | 'bottom' | 'left',
    field: 'width' | 'color' | 'style'
): keyof CSSProperties => {
    if (side === 'all') {
        if (field === 'width') return 'borderWidth';
        if (field === 'color') return 'borderColor';
        return 'borderStyle';
    }
    if (side === 'top') {
        if (field === 'width') return 'borderTopWidth';
        if (field === 'color') return 'borderTopColor';
        return 'borderTopStyle';
    }
    if (side === 'right') {
        if (field === 'width') return 'borderRightWidth';
        if (field === 'color') return 'borderRightColor';
        return 'borderRightStyle';
    }
    if (side === 'bottom') {
        if (field === 'width') return 'borderBottomWidth';
        if (field === 'color') return 'borderBottomColor';
        return 'borderBottomStyle';
    }
    if (field === 'width') return 'borderLeftWidth';
    if (field === 'color') return 'borderLeftColor';
    return 'borderLeftStyle';
};

export const TEXT_ELEMENT_OPTIONS = [
    { value: 'h1', label: 'H1', variant: 'h1', component: 'h1' },
    { value: 'h2', label: 'H2', variant: 'h2', component: 'h2' },
    { value: 'h3', label: 'H3', variant: 'h3', component: 'h3' },
    { value: 'h4', label: 'H4', variant: 'h4', component: 'h4' },
    { value: 'h5', label: 'H5', variant: 'h5', component: 'h5' },
    { value: 'p', label: 'Paragraph', variant: 'body1', component: 'p' }
] as const;

export type TextElementValue = typeof TEXT_ELEMENT_OPTIONS[number]['value'];
export type TextFormatValue = 'normal' | 'bold' | 'italic';

export type NavMenuItem = {
    id: string;
    label: string;
    pageSlug?: string;
    children?: NavMenuItem[];
};
