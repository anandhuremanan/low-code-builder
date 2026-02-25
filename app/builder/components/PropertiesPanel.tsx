import React, { useEffect, useState } from 'react';
import { useBuilder } from '../context';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { X, Plus, Trash2 } from 'lucide-react';
import { updateClass, getTailwindValue, getBorderValue, updateBorderClass, getEffectValue, updateEffectClass } from '../../lib/styleUtils';
import { SecondaryPropertiesSections } from './properties/SecondaryPropertiesSections';
import {
    TEXT_SIZE_CLASSES,
    TEXT_ALIGN_CLASSES,
    OBJECT_FIT_CLASSES,
    extractTokenFromClass,
    extractPaddingTokens,
    extractMarginTokens,
    widthTokenToPx,
    styleTokenToCss,
    normalizeSpacingInput,
    replaceTokenInClass,
    replacePaddingTokens,
    replaceMarginTokens,
    marginTokensToStyle,
    paddingTokensToStyle,
    sizeTokenToStyle,
    isHexColor,
    sideToBorderProp,
    TEXT_ELEMENT_OPTIONS
} from './properties/styleHelpers';
import type { TextElementValue, TextFormatValue, NavMenuItem } from './properties/styleHelpers';

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
        textAlign: '',
        objectFit: ''
    });
    const [borderState, setBorderState] = useState({
        radius: '',
        width: '',
        color: '',
        style: ''
    });
    const [borderSide, setBorderSide] = useState<'all' | 'top' | 'right' | 'bottom' | 'left'>('all');
    const [effectState, setEffectState] = useState({
        shadow: '',
        opacity: ''
    });
    const [dataGridProps, setDataGridProps] = useState({
        apiUrl: '',
        columns: [] as any[]
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
                padding: extractPaddingTokens(className),
                margin: extractMarginTokens(className),
                fontSize: extractTokenFromClass(className, TEXT_SIZE_CLASSES),
                textAlign: extractTokenFromClass(className, TEXT_ALIGN_CLASSES),
                objectFit: extractTokenFromClass(className, OBJECT_FIT_CLASSES)
            });
            setBorderState({
                radius: getBorderValue(className, 'radius'),
                width: String(selectedNode.props?.style?.borderWidth || widthTokenToPx(getBorderValue(className, 'width')) || ''),
                color: selectedNode.props?.style?.borderColor || '',
                style: String(selectedNode.props?.style?.borderStyle || styleTokenToCss(getBorderValue(className, 'style')) || '')
            });
            setEffectState({
                shadow: getEffectValue(className, 'shadow'),
                opacity: getEffectValue(className, 'opacity')
            });
            if (selectedNode.type === 'DataGrid') {
                setDataGridProps({
                    apiUrl: selectedNode.props.apiUrl || '',
                    columns: selectedNode.props.columns || []
                });
            }
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

    const handleCustomStyleChange = (styleId: string) => {
        const nextProps = { ...localProps };
        if (styleId) {
            nextProps.customStyleId = styleId;
        } else {
            delete nextProps.customStyleId;
        }

        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { customStyleId: styleId || undefined } }
        });
    };

    // Updates a specific style field in local state AND the node's className
    const handleStyleChange = (field: keyof typeof styles, prefix: string, value: string) => {
        // Update local state immediately so input reflects user typing
        const normalizedValue = field === 'padding' || field === 'margin' ? normalizeSpacingInput(value) : value;
        setStyles(prev => ({ ...prev, [field]: normalizedValue }));

        // Update node prop
        const currentClass = localProps.className || '';
        const newClass = field === 'fontSize'
            ? replaceTokenInClass(currentClass, TEXT_SIZE_CLASSES, normalizedValue)
            : field === 'textAlign'
                ? replaceTokenInClass(currentClass, TEXT_ALIGN_CLASSES, normalizedValue)
                : field === 'objectFit'
                    ? replaceTokenInClass(currentClass, OBJECT_FIT_CLASSES, normalizedValue)
                    : field === 'padding'
                        ? replacePaddingTokens(currentClass, normalizedValue)
                        : field === 'margin'
                            ? replaceMarginTokens(currentClass, normalizedValue)
                            : updateClass(currentClass, prefix, normalizedValue);

        const nextProps: Record<string, any> = { className: newClass };
        if (field === 'margin') {
            const marginStyle = marginTokensToStyle(normalizedValue);
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
        } else if (field === 'padding') {
            const paddingStyle = paddingTokensToStyle(normalizedValue);
            const currentStyle = { ...(localProps.style || {}) };
            delete currentStyle.padding;
            delete currentStyle.paddingTop;
            delete currentStyle.paddingRight;
            delete currentStyle.paddingBottom;
            delete currentStyle.paddingLeft;
            nextProps.style = { ...currentStyle, ...paddingStyle };
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

    // Border & Effect Handlers
    const handleBorderChange = (field: 'radius' | 'width' | 'color' | 'style', value: string) => {
        setBorderState(prev => ({ ...prev, [field]: value }));
        const currentClass = localProps.className || '';
        if (field === 'radius') {
            const newClass = updateBorderClass(currentClass, field, value);
            const nextProps = { ...localProps, className: newClass };
            setLocalProps(nextProps);
            dispatch({
                type: 'UPDATE_NODE',
                payload: { id: selectedNode.id, props: nextProps }
            });
            return;
        }

        const sideProp = sideToBorderProp(borderSide, field);
        const nextStyle = { ...(localProps.style || {}) } as Record<string, any>;
        const cleanedClass = updateBorderClass(updateBorderClass(updateBorderClass(currentClass, 'width', ''), 'style', ''), 'color', '');
        const nextValue = field === 'width' || field === 'style' ? value.trim() : value.trim();
        if (nextValue) {
            nextStyle[sideProp] = nextValue;
        } else {
            delete nextStyle[sideProp];
        }

        const nextProps = { ...localProps, className: cleanedClass, style: nextStyle };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: nextProps }
        });
    };

    const handleEffectChange = (field: 'shadow' | 'opacity', value: string) => {
        setEffectState(prev => ({ ...prev, [field]: value }));
        const currentClass = localProps.className || '';
        const newClass = updateEffectClass(currentClass, field, value);

        const nextProps = { ...localProps, className: newClass };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: nextProps }
        });
    };

    // Data Grid Handlers
    const handleDataGridChange = (key: 'apiUrl' | 'columns', value: any) => {
        setDataGridProps(prev => ({ ...prev, [key]: value }));
        const nextProps = { ...localProps, [key]: value };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: nextProps }
        });
    };

    const addDataGridColumn = () => {
        const columns = [...(dataGridProps.columns || [])];
        columns.push({ field: 'newField', headerName: 'New Column', width: 150 });
        handleDataGridChange('columns', columns);
    };

    const updateDataGridColumn = (index: number, key: string, val: any) => {
        const columns = [...(dataGridProps.columns || [])];
        columns[index] = { ...columns[index], [key]: val };
        handleDataGridChange('columns', columns);
    };

    const removeDataGridColumn = (index: number) => {
        const columns = [...(dataGridProps.columns || [])];
        columns.splice(index, 1);
        handleDataGridChange('columns', columns);
    };

    const parseCsvLabels = (raw: string): string[] =>
        raw
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

    const parseCsvNumbers = (raw: string): number[] =>
        raw
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item));

    const getChartPointColors = (): string[] => {
        const colors = localProps.pointColors;
        if (!Array.isArray(colors)) return [];
        return colors as string[];
    };

    const updateChartPointColor = (index: number, value: string) => {
        const labels = Array.isArray(localProps.labels) ? localProps.labels : [];
        const targetLength = Math.max(labels.length, index + 1);
        const base = getChartPointColors();
        const fallback = localProps.color || '#1976d2';
        const next = Array.from({ length: targetLength }, (_, i) => base[i] || fallback);
        next[index] = value;
        handleChange('pointColors', next);
    };

    // Tabs Handlers
    const getTabsItems = (): { label: string; id: string }[] => {
        const items = localProps.items;
        if (!Array.isArray(items)) return [];
        return items as { label: string; id: string }[];
    };

    const updateTabsItems = (items: { label: string; id: string }[]) => {
        const nextProps = { ...localProps, items };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { items } }
        });
    };

    const addTabItem = () => {
        const items = [...getTabsItems()];
        items.push({
            id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: 'New Tab'
        });
        updateTabsItems(items);
        // We also need to add a corresponding child container for the new tab?
        // Tabs logic handles initialization on demand, so we don't strictly need to add it here.
        // But if we want consistent UX, we could.
        // For now, let's rely on Tabs.tsx "Initialize Content" button.
    };

    const removeTabItem = (index: number) => {
        const items = [...getTabsItems()];
        items.splice(index, 1);
        updateTabsItems(items);

        // We should also remove the corresponding child node if it exists?
        // If we remove tab 1, child at index 1 becomes child for tab 2 (which becomes tab 1).
        // This shifts content.
        // Ideally we should remove the child at that index too.
        if (selectedNode.children && selectedNode.children[index]) {
            dispatch({
                type: 'DELETE_NODE',
                payload: { id: selectedNode.children[index].id }
            });
        }
    };

    const updateTabItem = (index: number, label: string) => {
        const items = [...getTabsItems()];
        if (!items[index]) return;
        items[index] = { ...items[index], label };
        updateTabsItems(items);
    };

    // Stepper handlers
    const getStepperItems = (): { label: string; optional?: boolean }[] => {
        const steps = localProps.steps;
        if (!Array.isArray(steps)) return [];
        return steps as { label: string; optional?: boolean }[];
    };

    const updateStepperItems = (steps: { label: string; optional?: boolean }[]) => {
        const nextProps = { ...localProps, steps };
        setLocalProps(nextProps);
        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: selectedNode.id, props: { steps } }
        });
    };

    const createStepperContentContainer = (label?: string) => ({
        id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'Container' as const,
        props: {
            className: 'p-4 border border-dashed border-gray-200 min-h-[100px]',
            children: `Content for ${label || 'step'}`
        },
        children: []
    });

    const addStepperContentContainer = (index: number, label?: string) => {
        dispatch({
            type: 'ADD_NODE',
            payload: {
                parentId: selectedNode.id,
                node: createStepperContentContainer(label),
                index
            }
        });
    };

    const ensureStepperStepContainers = (steps: { label: string; optional?: boolean }[]) => {
        const existingCount = selectedNode.children?.length || 0;
        if (existingCount >= steps.length) return;

        for (let i = existingCount; i < steps.length; i += 1) {
            addStepperContentContainer(i, steps[i]?.label);
        }
    };

    const addStepperItem = () => {
        const steps = [...getStepperItems()];
        const newStep = {
            label: `Step ${steps.length + 1}`,
            optional: false
        };
        steps.push(newStep);
        updateStepperItems(steps);
        addStepperContentContainer(steps.length - 1, newStep.label);
    };

    const removeStepperItem = (index: number) => {
        const steps = [...getStepperItems()];
        steps.splice(index, 1);
        updateStepperItems(steps);

        const nextActiveStep = Math.max(0, Math.min(Number(localProps.activeStep || 0), steps.length));
        handleChange('activeStep', nextActiveStep);

        if (selectedNode.children && selectedNode.children[index]) {
            dispatch({
                type: 'DELETE_NODE',
                payload: { id: selectedNode.children[index].id }
            });
        }
    };

    const updateStepperItem = (index: number, key: 'label' | 'optional', value: string | boolean) => {
        const steps = [...getStepperItems()];
        if (!steps[index]) return;
        steps[index] = { ...steps[index], [key]: value };
        updateStepperItems(steps);
    };

    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col" >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <Typography variant="h6" className="font-semibold">
                    Properties
                </Typography>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedNode.type}
                </div>
            </div>


            <div className="p-4 flex-1 overflow-y-auto space-y-6">

                {/* Tabs Settings */}
                {selectedNode.type === 'Tabs' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tabs Management</label>
                        <div className="space-y-2">
                            {getTabsItems().map((item, index) => (
                                <div key={item.id || index} className="flex gap-2 items-center">
                                    <Input
                                        size="small"
                                        value={item.label}
                                        onChange={(e) => updateTabItem(index, e.target.value)}
                                        placeholder="Tab Label"
                                        className="flex-1"
                                    />
                                    <button
                                        onClick={() => removeTabItem(index)}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                                        disabled={getTabsItems().length <= 1}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addTabItem}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                            >
                                <Plus size={14} />
                                Add Tab
                            </button>
                        </div>
                        <div className="h-px bg-gray-200 my-4" />
                    </div>
                )}

                {/* Stepper Settings */}
                {selectedNode.type === 'Stepper' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stepper Settings</label>
                        <div className="space-y-2">
                            {getStepperItems().map((step, index) => (
                                <div key={`${step.label}-${index}`} className="rounded border border-gray-200 p-2 space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            size="small"
                                            value={step.label}
                                            onChange={(e) => updateStepperItem(index, 'label', e.target.value)}
                                            placeholder="Step label"
                                            className="flex-1"
                                        />
                                        <button
                                            onClick={() => removeStepperItem(index)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                                            disabled={getStepperItems().length <= 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-gray-500">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(step.optional)}
                                            onChange={(e) => updateStepperItem(index, 'optional', e.target.checked)}
                                        />
                                        Optional step
                                    </label>
                                </div>
                            ))}
                            <button
                                onClick={addStepperItem}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                            >
                                <Plus size={14} />
                                Add Step
                            </button>
                            {(selectedNode.children?.length || 0) < getStepperItems().length && (
                                <button
                                    onClick={() => ensureStepperStepContainers(getStepperItems())}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus size={14} />
                                    Add Missing Step Containers
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Active Step</label>
                                <Input
                                    size="small"
                                    type="number"
                                    value={localProps.activeStep ?? 0}
                                    onChange={(e) => handleChange('activeStep', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Orientation</label>
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={localProps.orientation || 'horizontal'}
                                    onChange={(e) => handleChange('orientation', e.target.value)}
                                >
                                    <option value="horizontal">Horizontal</option>
                                    <option value="vertical">Vertical</option>
                                </select>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                                type="checkbox"
                                checked={Boolean(localProps.linear)}
                                onChange={(e) => handleChange('linear', e.target.checked)}
                            />
                            Linear flow
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                                type="checkbox"
                                checked={Boolean(localProps.alternativeLabel)}
                                onChange={(e) => handleChange('alternativeLabel', e.target.checked)}
                            />
                            Alternative labels (horizontal only)
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                                type="checkbox"
                                checked={Boolean(localProps.showStatusText)}
                                onChange={(e) => handleChange('showStatusText', e.target.checked)}
                            />
                            Show status text
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                                type="checkbox"
                                checked={Boolean(localProps.showControls)}
                                onChange={(e) => handleChange('showControls', e.target.checked)}
                            />
                            Show controls
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Back Label</label>
                                <Input
                                    size="small"
                                    value={localProps.backLabel || ''}
                                    onChange={(e) => handleChange('backLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Next Label</label>
                                <Input
                                    size="small"
                                    value={localProps.nextLabel || ''}
                                    onChange={(e) => handleChange('nextLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Skip Label</label>
                                <Input
                                    size="small"
                                    value={localProps.skipLabel || ''}
                                    onChange={(e) => handleChange('skipLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Finish Label</label>
                                <Input
                                    size="small"
                                    value={localProps.finishLabel || ''}
                                    onChange={(e) => handleChange('finishLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Reset Label</label>
                                <Input
                                    size="small"
                                    value={localProps.resetLabel || ''}
                                    onChange={(e) => handleChange('resetLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Step Prefix</label>
                                <Input
                                    size="small"
                                    value={localProps.stepPrefixText || ''}
                                    onChange={(e) => handleChange('stepPrefixText', e.target.value)}
                                    placeholder="Step"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Completed Text</label>
                            <Input
                                size="small"
                                value={localProps.completedText || ''}
                                onChange={(e) => handleChange('completedText', e.target.value)}
                            />
                        </div>

                        <div className="h-px bg-gray-200 my-4" />
                    </div>
                )}

                {/* Input Settings */}
                {selectedNode.type === 'Input' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Settings</label>
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Label</label>
                                <Input
                                    size="small"
                                    value={localProps.label || ''}
                                    onChange={(e) => handleChange('label', e.target.value)}
                                    placeholder="Input Label"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Type</label>
                                <select
                                    className="w-full text-sm border rounded p-1"
                                    value={localProps.type || 'text'}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="password">Password</option>
                                    <option value="number">Number</option>
                                    <option value="tel">Telephone</option>
                                    <option value="url">URL</option>
                                    <option value="date">Date</option>
                                    <option value="search">Search</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Placeholder</label>
                                <Input
                                    size="small"
                                    value={localProps.placeholder || ''}
                                    onChange={(e) => handleChange('placeholder', e.target.value)}
                                    placeholder="Placeholder text"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-xs text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={Boolean(localProps.disableBorder)}
                                    onChange={(e) => handleChange('disableBorder', e.target.checked)}
                                />
                                Disable Border
                            </label>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Background Color</label>
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
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Label Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={localProps.labelColor || '#374151'}
                                        onChange={(e) => handleChange('labelColor', e.target.value)}
                                        className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                    />
                                    <Input
                                        size="small"
                                        value={localProps.labelColor || '#374151'}
                                        onChange={(e) => handleChange('labelColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200 my-4" />
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom CSS Style</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Global Style</label>
                        <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            value={localProps.customStyleId || ''}
                            onChange={(e) => handleCustomStyleChange(e.target.value)}
                        >
                            <option value="">None (use component defaults)</option>
                            {state.customStyles.map((style) => (
                                <option key={style.id} value={style.id}>
                                    {style.name} (.{style.className})
                                </option>
                            ))}
                        </select>
                    </div>
                    {state.customStyles.length === 0 && (
                        <p className="text-[11px] text-gray-500">
                            No global styles yet. Add them from the top toolbar.
                        </p>
                    )}
                </div>

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
                                placeholder="p-4 px-2 py-2 pt-1"
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

                {/* Borders Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Borders</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Apply To</label>
                        <select
                            className="w-full text-sm border rounded p-1"
                            value={borderSide}
                            onChange={(e) => setBorderSide(e.target.value as 'all' | 'top' | 'right' | 'bottom' | 'left')}
                        >
                            <option value="all">All Sides</option>
                            <option value="top">Top</option>
                            <option value="right">Right</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Radius</label>
                            <select
                                className="w-full text-sm border rounded p-1"
                                value={borderState.radius}
                                onChange={(e) => handleBorderChange('radius', e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="rounded-sm">Small</option>
                                <option value="rounded">Normal</option>
                                <option value="rounded-md">Medium</option>
                                <option value="rounded-lg">Large</option>
                                <option value="rounded-xl">XL</option>
                                <option value="rounded-2xl">2XL</option>
                                <option value="rounded-full">Full</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Width</label>
                            <select
                                className="w-full text-sm border rounded p-1"
                                value={borderState.width}
                                onChange={(e) => handleBorderChange('width', e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="1px">1px</option>
                                <option value="2px">2px</option>
                                <option value="4px">4px</option>
                                <option value="8px">8px</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={isHexColor(borderState.color) ? borderState.color : '#d1d5db'}
                                    onChange={(e) => handleBorderChange('color', e.target.value)}
                                    className="h-8 w-8 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                                <Input
                                    size="small"
                                    placeholder="#d1d5db"
                                    value={borderState.color}
                                    onChange={(e) => handleBorderChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Style</label>
                            <select
                                className="w-full text-sm border rounded p-1"
                                value={borderState.style}
                                onChange={(e) => handleBorderChange('style', e.target.value)}
                            >
                                <option value="">Default</option>
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Effects Section */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effects</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Shadow</label>
                            <select
                                className="w-full text-sm border rounded p-1"
                                value={effectState.shadow}
                                onChange={(e) => handleEffectChange('shadow', e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="shadow-sm">Small</option>
                                <option value="shadow">Normal</option>
                                <option value="shadow-md">Medium</option>
                                <option value="shadow-lg">Large</option>
                                <option value="shadow-xl">XL</option>
                                <option value="shadow-2xl">2XL</option>
                                <option value="shadow-inner">Inner</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Opacity</label>
                            <select
                                className="w-full text-sm border rounded p-1"
                                value={effectState.opacity}
                                onChange={(e) => handleEffectChange('opacity', e.target.value)}
                            >
                                <option value="">100%</option>
                                <option value="opacity-90">90%</option>
                                <option value="opacity-75">75%</option>
                                <option value="opacity-50">50%</option>
                                <option value="opacity-25">25%</option>
                                <option value="opacity-0">0%</option>
                            </select>
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
                        <div className="space-y-1 pt-2 border-t border-gray-100">
                            <label className="text-xs text-gray-400">Button Icon</label>
                            <div className="grid grid-cols-[2fr_1fr] gap-2">
                                <Input
                                    size="small"
                                    placeholder="icon name"
                                    value={localProps.icon || ''}
                                    onChange={(e) => handleChange('icon', e.target.value)}
                                />
                                <select
                                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                    value={localProps.iconPos || 'start'}
                                    onChange={(e) => handleChange('iconPos', e.target.value)}
                                >
                                    <option value="start">Start</option>
                                    <option value="end">End</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Link Page</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={localProps.pageSlug || ''}
                                onChange={(e) => handleChange('pageSlug', e.target.value)}
                            >
                                <option value="">No Link</option>
                                {pageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
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
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Object Fit</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={styles.objectFit || ''}
                                onChange={(e) => handleStyleChange('objectFit', 'object-', e.target.value)}
                            >
                                <option value="">Default</option>
                                <option value="object-contain">Contain</option>
                                <option value="object-cover">Cover</option>
                                <option value="object-fill">Fill</option>
                                <option value="object-none">None</option>
                                <option value="object-scale-down">Scale Down</option>
                            </select>
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

                <SecondaryPropertiesSections
                    selectedNode={selectedNode}
                    localProps={localProps}
                    dataGridProps={dataGridProps}
                    handleChange={handleChange}
                    addOption={addOption}
                    handleOptionChange={handleOptionChange}
                    removeOption={removeOption}
                    handleDataGridChange={handleDataGridChange}
                    addDataGridColumn={addDataGridColumn}
                    updateDataGridColumn={updateDataGridColumn}
                    removeDataGridColumn={removeDataGridColumn}
                    parseCsvLabels={parseCsvLabels}
                    parseCsvNumbers={parseCsvNumbers}
                    getChartPointColors={getChartPointColors}
                    updateChartPointColor={updateChartPointColor}
                    handleNodeStyleChange={handleNodeStyleChange}
                />

                <div className="border-t border-gray-200 pt-4 mt-8">
                    <button
                        onClick={handleDelete}
                        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center justify-center gap-2 transition-colors border border-red-200"
                    >
                        <X size={16} /> Delete Component
                    </button>
                </div>
            </div>
        </div >
    );
};

