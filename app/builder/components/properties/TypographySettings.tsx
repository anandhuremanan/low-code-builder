import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';
import { TEXT_ELEMENT_OPTIONS } from './styleHelpers';
import type { TextElementValue, TextFormatValue } from './styleHelpers';

export const TypographySettings = ({ p }: { p: NodeProperties }) => {
    const selectedNode = p.selectedNode;
    if (!selectedNode) return null;

    if (selectedNode.type === 'Text') {
        return (
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Tag</label>
                        <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            value={p.textTypography.element}
                            onChange={(e) => p.handleTextElementChange(e.target.value as TextElementValue)}
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
                            value={p.textTypography.format}
                            onChange={(e) => p.handleTextFormatPresetChange(e.target.value as TextFormatValue)}
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
                            value={p.localProps.style?.color || '#1f2937'}
                            onChange={(e) => p.handleTextColorChange(e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.style?.color || '#1f2937'}
                            onChange={(e) => p.handleTextColorChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (['Button', 'Input'].includes(selectedNode.type)) {
        return (
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Size</label>
                        <Input
                            size="small"
                            placeholder="text-base"
                            value={p.styles.fontSize}
                            onChange={(e) => p.handleStyleChange('fontSize', 'text-', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Align</label>
                        <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            onChange={(e) => p.handleStyleChange('textAlign', 'text-', e.target.value)}
                            value={p.styles.textAlign || 'text-left'}
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
                            value={p.localProps.style?.color || '#1f2937'}
                            onChange={(e) => p.handleTextColorChange(e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.style?.color || '#1f2937'}
                            onChange={(e) => p.handleTextColorChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
