import React, { useEffect, useState } from 'react';
import { useBuilder } from '../context';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { X, Plus, Trash2 } from 'lucide-react';
import { updateClass, getTailwindValue } from '../../lib/styleUtils';

const TEXT_SIZE_CLASSES = new Set([
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

const TEXT_ALIGN_CLASSES = new Set([
    'text-left',
    'text-center',
    'text-right',
    'text-justify',
    'text-start',
    'text-end'
]);

const extractTokenFromClass = (className: string, allowed: Set<string>): string => {
    const tokens = className.split(/\s+/).filter(Boolean);
    return tokens.find((token) => allowed.has(token)) || '';
};

const replaceTokenInClass = (className: string, allowed: Set<string>, nextToken: string): string => {
    const tokens = className.split(/\s+/).filter(Boolean);
    const filtered = tokens.filter((token) => !allowed.has(token));
    if (!nextToken.trim()) return filtered.join(' ').trim();
    return [...filtered, nextToken.trim()].join(' ').trim();
};

const extractMarginToken = (className: string): string => {
    if (!className) return '';
    const match = className.match(/(?:^|\s)(-?m[trblxy]?-(?:[\w./-]+|\[[^[\]]+\]))(?:$|\s)/);
    return match ? match[1] : '';
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

const sizeTokenToStyle = (token: string): Record<string, string> => {
    const match = token.trim().match(/^([wh])-(.+)$/);
    if (!match) return {};
    const [, axis, raw] = match;

    if (raw === 'full') return axis === 'w' ? { width: '100%' } : { height: '100%' };
    if (raw === 'screen') return axis === 'w' ? { width: '100vw' } : { height: '100vh' };

    const cssValue = spacingOrArbitraryToCss(raw);
    if (!cssValue) return {};
    return axis === 'w' ? { width: cssValue } : { height: cssValue };
};

const TEXT_ELEMENT_OPTIONS = [
    { value: 'h1', label: 'H1', variant: 'h1', component: 'h1' },
    { value: 'h2', label: 'H2', variant: 'h2', component: 'h2' },
    { value: 'h3', label: 'H3', variant: 'h3', component: 'h3' },
    { value: 'h4', label: 'H4', variant: 'h4', component: 'h4' },
    { value: 'h5', label: 'H5', variant: 'h5', component: 'h5' },
    { value: 'p', label: 'Paragraph', variant: 'body1', component: 'p' }
] as const;

type TextElementValue = typeof TEXT_ELEMENT_OPTIONS[number]['value'];
type TextFormatValue = 'normal' | 'bold' | 'italic';
type NavMenuItem = {
    id: string;
    label: string;
    pageSlug?: string;
    children?: NavMenuItem[];
};

export const PropertiesPanel = () => {
    const { state, dispatch } = useBuilder();
    const selectedNodeId = state.selectedNodeId;

    // Derived selected node
    const findNode = (nodes: any[], id: string): any => {
        for (const node of nodes) {
            if (node.id === id) return node;
            const found = findNode(node.children, id);
            if (found) return found;
        }
        return null;
    };

    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const selectedNode = selectedNodeId && currentPage ? findNode(currentPage.nodes, selectedNodeId) : null;
    const pageOptions = state.pages.map((page) => ({ label: page.name, value: page.slug }));

    // Local state for style inputs to allow editing without cursor jumping or disappearing values
    const [styles, setStyles] = useState({
        width: '',
        height: '',
        padding: '',
        margin: '',
        fontSize: '',
        textAlign: ''
    });
    const [textTypography, setTextTypography] = useState<{
        element: TextElementValue;
        format: TextFormatValue;
    }>({
        element: 'p',
        format: 'normal'
    });

    // Local state for other props
    const [localProps, setLocalProps] = useState<Record<string, any>>({});

    useEffect(() => {
        if (selectedNode) {
            setLocalProps(selectedNode.props);
            const className = selectedNode.props.className || '';
            setStyles({
                width: getTailwindValue(className, 'w-'),
                height: getTailwindValue(className, 'h-'),
                padding: getTailwindValue(className, 'p-'),
                margin: extractMarginToken(className),
                fontSize: extractTokenFromClass(className, TEXT_SIZE_CLASSES),
                textAlign: extractTokenFromClass(className, TEXT_ALIGN_CLASSES)
            });
            const variant = selectedNode.props?.variant || 'body1';
            const style = selectedNode.props?.style || {};
            const currentFormat: TextFormatValue = style.fontStyle === 'italic'
                ? 'italic'
                : Number(style.fontWeight || 400) >= 700
                    ? 'bold'
                    : 'normal';
            const matchingElement = TEXT_ELEMENT_OPTIONS.find((item) => item.variant === variant)?.value || 'p';
            setTextTypography({
                element: matchingElement,
                format: currentFormat
            });
        }
    }, [selectedNode?.id]);

    if (!selectedNode) {
        return (
            <div className="w-80 h-full bg-white border-l border-gray-200 p-4">
                <Typography variant="body2" className="text-gray-500">
                    Select a component to edit properties.
                </Typography>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        const newProps = { ...localProps, [key]: value };
        setLocalProps(newProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { [key]: value } }
        });
    };

    // Updates a specific style field in local state AND the node's className
    const handleStyleChange = (field: keyof typeof styles, prefix: string, value: string) => {
        // Update local state immediately so input reflects user typing
        setStyles(prev => ({ ...prev, [field]: value }));

        // Update node prop
        const currentClass = localProps.className || '';
        const newClass = field === 'fontSize'
            ? replaceTokenInClass(currentClass, TEXT_SIZE_CLASSES, value)
            : field === 'textAlign'
                ? replaceTokenInClass(currentClass, TEXT_ALIGN_CLASSES, value)
                : updateClass(currentClass, prefix, value);

        const nextProps: Record<string, any> = { className: newClass };
        if (field === 'margin') {
            const marginStyle = marginTokenToStyle(value);
            const currentStyle = { ...(localProps.style || {}) };
            delete currentStyle.margin;
            delete currentStyle.marginTop;
            delete currentStyle.marginRight;
            delete currentStyle.marginBottom;
            delete currentStyle.marginLeft;
            nextProps.style = { ...currentStyle, ...marginStyle };
        } else if (field === 'width' || field === 'height') {
            const sizeStyle = sizeTokenToStyle(value);
            const currentStyle = { ...(localProps.style || {}) };
            if (field === 'width') delete currentStyle.width;
            if (field === 'height') delete currentStyle.height;
            nextProps.style = { ...currentStyle, ...sizeStyle };
        }

        // Update localProps to keep it in sync for next render
        setLocalProps(prev => ({ ...prev, ...nextProps }));

        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: nextProps }
        });
    };

    const handleDelete = () => {
        dispatch({ type: 'DELETE_NODE', payload: { id: selectedNode.id } });
        dispatch({ type: 'SELECT_NODE', payload: { id: null } });
    };

    const handleNodeStyleChange = (key: string, value: string) => {
        const nextStyle = { ...(localProps.style || {}), [key]: value };
        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    const handleImageUpload = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const src = typeof reader.result === 'string' ? reader.result : '';
            const nextProps = { ...localProps, src };
            setLocalProps(nextProps);
            dispatch({
                type: 'UPDATE_NODE',
                payload: { id: selectedNode.id, props: { src } }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleImageSizeChange = (key: 'width' | 'height', value: string) => {
        const nextStyle = { ...(localProps.style || {}) };
        if (!value.trim()) {
            delete nextStyle[key];
        } else {
            nextStyle[key] = `${value}px`;
        }
        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    const getMenuItems = (): NavMenuItem[] => {
        const items = localProps.menuItems;
        if (!Array.isArray(items)) return [];
        return items as NavMenuItem[];
    };

    const updateMenuItems = (menuItems: NavMenuItem[]) => {
        const nextProps = { ...localProps, menuItems };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { menuItems } }
        });
    };

    const addMenuItem = () => {
        const items = [...getMenuItems()];
        items.push({
            id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: 'New Menu',
            pageSlug: pageOptions[0]?.value || '/',
            children: []
        });
        updateMenuItems(items);
    };

    const removeMenuItem = (index: number) => {
        const items = [...getMenuItems()];
        items.splice(index, 1);
        updateMenuItems(items);
    };

    const updateMenuItem = (index: number, key: 'label' | 'pageSlug', value: string) => {
        const items = [...getMenuItems()];
        const current = items[index];
        if (!current) return;
        items[index] = { ...current, [key]: value };
        updateMenuItems(items);
    };

    const addSubMenuItem = (menuIndex: number) => {
        const items = [...getMenuItems()];
        const current = items[menuIndex];
        if (!current) return;
        const children = [...(current.children || [])];
        children.push({
            id: `submenu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: 'New Submenu',
            pageSlug: pageOptions[0]?.value || '/'
        });
        items[menuIndex] = { ...current, children };
        updateMenuItems(items);
    };

    const removeSubMenuItem = (menuIndex: number, childIndex: number) => {
        const items = [...getMenuItems()];
        const current = items[menuIndex];
        if (!current) return;
        const children = [...(current.children || [])];
        children.splice(childIndex, 1);
        items[menuIndex] = { ...current, children };
        updateMenuItems(items);
    };

    const updateSubMenuItem = (
        menuIndex: number,
        childIndex: number,
        key: 'label' | 'pageSlug',
        value: string
    ) => {
        const items = [...getMenuItems()];
        const current = items[menuIndex];
        if (!current) return;
        const children = [...(current.children || [])];
        const child = children[childIndex];
        if (!child) return;
        children[childIndex] = { ...child, [key]: value };
        items[menuIndex] = { ...current, children };
        updateMenuItems(items);
    };

    const handleButtonStyleChange = (key: 'backgroundColor' | 'color', value: string) => {
        handleNodeStyleChange(key, value);
    };

    const handleContainerAlignmentChange = (
        axis: 'horizontal' | 'vertical',
        value: string
    ) => {
        const nextStyle = { ...(localProps.style || {}), display: 'flex' };
        if (axis === 'horizontal') {
            nextStyle.justifyContent = value;
        } else {
            nextStyle.alignItems = value;
        }
        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    const getContainerFlow = (): 'block' | 'column' | 'row' | 'row-wrap' => {
        const style = localProps.style || {};
        if (style.display !== 'flex') return 'block';
        if (style.flexDirection === 'column') return 'column';
        if (style.flexDirection === 'row' && style.flexWrap === 'wrap') return 'row-wrap';
        return 'row';
    };

    const handleContainerFlowChange = (value: 'block' | 'column' | 'row' | 'row-wrap') => {
        const nextStyle = { ...(localProps.style || {}) };

        if (value === 'block') {
            delete nextStyle.display;
            delete nextStyle.flexDirection;
            delete nextStyle.flexWrap;
            delete nextStyle.justifyContent;
            delete nextStyle.alignItems;
        } else if (value === 'column') {
            nextStyle.display = 'flex';
            nextStyle.flexDirection = 'column';
            nextStyle.flexWrap = 'nowrap';
        } else if (value === 'row') {
            nextStyle.display = 'flex';
            nextStyle.flexDirection = 'row';
            nextStyle.flexWrap = 'nowrap';
        } else {
            nextStyle.display = 'flex';
            nextStyle.flexDirection = 'row';
            nextStyle.flexWrap = 'wrap';
        }

        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    const handleTextElementChange = (value: TextElementValue) => {
        const selected = TEXT_ELEMENT_OPTIONS.find((item) => item.value === value);
        if (!selected) return;

        setTextTypography((prev) => ({ ...prev, element: value }));
        const nextProps = { ...localProps, variant: selected.variant, component: selected.component };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: {
                id: selectedNode.id,
                props: { variant: selected.variant, component: selected.component }
            }
        });
    };

    const handleTextFormatPresetChange = (value: TextFormatValue) => {
        setTextTypography((prev) => ({ ...prev, format: value }));

        const nextStyle = { ...(localProps.style || {}) };
        if (value === 'bold') {
            nextStyle.fontWeight = 700;
            nextStyle.fontStyle = 'normal';
        } else if (value === 'italic') {
            nextStyle.fontWeight = 400;
            nextStyle.fontStyle = 'italic';
        } else {
            nextStyle.fontWeight = 400;
            nextStyle.fontStyle = 'normal';
        }

        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    const handleTextColorChange = (value: string) => {
        const nextStyle = { ...(localProps.style || {}), color: value };
        const nextProps = { ...localProps, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { style: nextStyle } }
        });
    };

    // Helper for Select Options
    const handleOptionChange = (idx: number, field: 'label' | 'value', val: string) => {
        const options = [...(localProps.options || [])];
        options[idx] = { ...options[idx], [field]: val };
        handleChange('options', options);
    };

    const addOption = () => {
        const options = [...(localProps.options || [])];
        options.push({ label: 'New Option', value: 'new_value' });
        handleChange('options', options);
    };

    const removeOption = (idx: number) => {
        const options = [...(localProps.options || [])];
        options.splice(idx, 1);
        handleChange('options', options);
    };

    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <Typography variant="h6" className="font-semibold">
                    Properties
                </Typography>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedNode.type}
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">

                {/* Layout Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layout & Sizing</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Width</label>
                            <Input
                                size="small"
                                placeholder="w-full, w-[100px]"
                                value={styles.width}
                                onChange={(e) => handleStyleChange('width', 'w-', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Height</label>
                            <Input
                                size="small"
                                placeholder="h-full, h-[100px]"
                                value={styles.height}
                                onChange={(e) => handleStyleChange('height', 'h-', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Spacing Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spacing</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Padding</label>
                            <Input
                                size="small"
                                placeholder="p-4, p-[10px]"
                                value={styles.padding}
                                onChange={(e) => handleStyleChange('padding', 'p-', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Margin</label>
                            <Input
                                size="small"
                                placeholder="m-4, m-[10px]"
                                value={styles.margin}
                                onChange={(e) => handleStyleChange('margin', 'm-', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Text Typography Section */}
                {/* Show if Text or Button or Input */}
                {['Button', 'Input'].includes(selectedNode.type) && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Size</label>
                                <Input
                                    size="small"
                                    placeholder="text-base"
                                    value={styles.fontSize}
                                    onChange={(e) => handleStyleChange('fontSize', 'text-', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Align</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    onChange={(e) => handleStyleChange('textAlign', 'text-', e.target.value)}
                                    value={styles.textAlign || 'text-left'}
                                >
                                    <option value="text-left">Left</option>
                                    <option value="text-center">Center</option>
                                    <option value="text-right">Right</option>
                                    <option value="text-justify">Justify</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Text Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localProps.style?.color || '#1f2937'}
                                    onChange={(e) => handleTextColorChange(e.target.value)}
                                    className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                                <Input
                                    size="small"
                                    value={localProps.style?.color || '#1f2937'}
                                    onChange={(e) => handleTextColorChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'Text' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Tag</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={textTypography.element}
                                    onChange={(e) => handleTextElementChange(e.target.value as TextElementValue)}
                                >
                                    {TEXT_ELEMENT_OPTIONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Format</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={textTypography.format}
                                    onChange={(e) => handleTextFormatPresetChange(e.target.value as TextFormatValue)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                    <option value="italic">Italic</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Text Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localProps.style?.color || '#1f2937'}
                                    onChange={(e) => handleTextColorChange(e.target.value)}
                                    className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                                <Input
                                    size="small"
                                    value={localProps.style?.color || '#1f2937'}
                                    onChange={(e) => handleTextColorChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'Button' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Button Style</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Background</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localProps.style?.backgroundColor || '#1976d2'}
                                        onChange={(e) => handleButtonStyleChange('backgroundColor', e.target.value)}
                                        className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                    />
                                    <Input
                                        size="small"
                                        value={localProps.style?.backgroundColor || '#1976d2'}
                                        onChange={(e) => handleButtonStyleChange('backgroundColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localProps.style?.color || '#ffffff'}
                                        onChange={(e) => handleButtonStyleChange('color', e.target.value)}
                                        className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                    />
                                    <Input
                                        size="small"
                                        value={localProps.style?.color || '#ffffff'}
                                        onChange={(e) => handleButtonStyleChange('color', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'Container' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Container Style</label>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Content Flow</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={getContainerFlow()}
                                onChange={(e) => handleContainerFlowChange(e.target.value as 'block' | 'column' | 'row' | 'row-wrap')}
                            >
                                <option value="block">Stack (Default)</option>
                                <option value="column">Flex Column</option>
                                <option value="row">Row</option>
                                <option value="row-wrap">Row Wrap</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Background</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localProps.style?.backgroundColor || '#ffffff'}
                                    onChange={(e) => handleNodeStyleChange('backgroundColor', e.target.value)}
                                    className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                                <Input
                                    size="small"
                                    value={localProps.style?.backgroundColor || '#ffffff'}
                                    onChange={(e) => handleNodeStyleChange('backgroundColor', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Horizontal</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={localProps.style?.justifyContent || 'flex-start'}
                                    onChange={(e) => handleContainerAlignmentChange('horizontal', e.target.value)}
                                >
                                    <option value="flex-start">Left</option>
                                    <option value="center">Center</option>
                                    <option value="flex-end">Right</option>
                                    <option value="space-between">Space Between</option>
                                    <option value="space-around">Space Around</option>
                                    <option value="space-evenly">Space Evenly</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Vertical</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={localProps.style?.alignItems || 'flex-start'}
                                    onChange={(e) => handleContainerAlignmentChange('vertical', e.target.value)}
                                >
                                    <option value="flex-start">Top</option>
                                    <option value="center">Center</option>
                                    <option value="flex-end">Bottom</option>
                                    <option value="stretch">Stretch</option>
                                    <option value="baseline">Baseline</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'Image' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image</label>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Image URL</label>
                            <Input
                                size="small"
                                value={localProps.src || ''}
                                placeholder="https://example.com/image.jpg"
                                onChange={(e) => handleChange('src', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Upload</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Alt Text</label>
                            <Input
                                size="small"
                                value={localProps.alt || ''}
                                onChange={(e) => handleChange('alt', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Width (px)</label>
                                <Input
                                    size="small"
                                    type="number"
                                    value={(localProps.style?.width || '').toString().replace('px', '')}
                                    onChange={(e) => handleImageSizeChange('width', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Height (px)</label>
                                <Input
                                    size="small"
                                    type="number"
                                    value={(localProps.style?.height || '').toString().replace('px', '')}
                                    onChange={(e) => handleImageSizeChange('height', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {(selectedNode.type === 'Header' || selectedNode.type === 'Footer') && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navigation</label>

                        {selectedNode.type === 'Header' && (
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Brand</label>
                                <Input
                                    size="small"
                                    value={localProps.brand || ''}
                                    onChange={(e) => handleChange('brand', e.target.value)}
                                />
                            </div>
                        )}

                        {selectedNode.type === 'Footer' && (
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Copyright</label>
                                <Input
                                    size="small"
                                    value={localProps.copyrightText || ''}
                                    onChange={(e) => handleChange('copyrightText', e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-400">Menu Items</label>
                            <button onClick={addMenuItem} className="text-blue-500 hover:text-blue-600">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {getMenuItems().map((item, menuIndex) => (
                                <div key={item.id} className="rounded border border-gray-200 p-2 space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Input
                                            size="small"
                                            placeholder="Menu label"
                                            value={item.label}
                                            onChange={(e) => updateMenuItem(menuIndex, 'label', e.target.value)}
                                        />
                                        <button onClick={() => removeMenuItem(menuIndex)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Link Page</label>
                                        <select
                                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                            value={item.pageSlug || '/'}
                                            onChange={(e) => updateMenuItem(menuIndex, 'pageSlug', e.target.value)}
                                        >
                                            {pageOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-gray-400">Sub Menus</label>
                                        <button onClick={() => addSubMenuItem(menuIndex)} className="text-blue-500 hover:text-blue-600">
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(item.children || []).map((child, childIndex) => (
                                            <div key={child.id} className="rounded border border-gray-100 p-2 space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        size="small"
                                                        placeholder="Submenu label"
                                                        value={child.label}
                                                        onChange={(e) => updateSubMenuItem(menuIndex, childIndex, 'label', e.target.value)}
                                                    />
                                                    <button onClick={() => removeSubMenuItem(menuIndex, childIndex)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <select
                                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                                    value={child.pageSlug || '/'}
                                                    onChange={(e) => updateSubMenuItem(menuIndex, childIndex, 'pageSlug', e.target.value)}
                                                >
                                                    {pageOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>

                    {/* Children / Text Content */}
                    {(selectedNode.type === 'Text' || selectedNode.type === 'Button') && (
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Text</label>
                            <Input
                                size="small"
                                value={localProps.children || ''}
                                onChange={(e) => handleChange('children', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Input Placeholder */}
                    {selectedNode.type === 'Input' && (
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Placeholder</label>
                            <Input
                                size="small"
                                value={localProps.placeholder || ''}
                                onChange={(e) => handleChange('placeholder', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Select Options */}
                    {selectedNode.type === 'Select' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-400">Options</label>
                                <button onClick={addOption} className="text-blue-500 hover:text-blue-600"><Plus size={14} /></button>
                            </div>
                            <div className="space-y-2">
                                {localProps.options?.map((opt: any, idx: number) => (
                                    <div key={idx} className="flex gap-1 items-center">
                                        <Input
                                            size="small"
                                            placeholder="Label"
                                            value={opt.label}
                                            onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                        />
                                        <Input
                                            size="small"
                                            placeholder="Value"
                                            value={opt.value}
                                            onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                                        />
                                        <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                <div className="border-t border-gray-200 pt-4 mt-8">
                    <button
                        onClick={handleDelete}
                        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center justify-center gap-2 transition-colors border border-red-200"
                    >
                        <X size={16} /> Delete Component
                    </button>
                </div>
            </div>
        </div>
    );
};
