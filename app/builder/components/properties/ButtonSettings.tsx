import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const ButtonSettings = ({ p }: { p: NodeProperties }) => {
    const resolvedActionType = p.localProps.actionType || (p.localProps.pageSlug ? 'navigate' : 'none');

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Button Style</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Background</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={p.localProps.style?.backgroundColor || '#1976d2'}
                            onChange={(e) => p.handleButtonStyleChange('backgroundColor', e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.style?.backgroundColor || '#1976d2'}
                            onChange={(e) => p.handleButtonStyleChange('backgroundColor', e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Text Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={p.localProps.style?.color || '#ffffff'}
                            onChange={(e) => p.handleButtonStyleChange('color', e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.style?.color || '#ffffff'}
                            onChange={(e) => p.handleButtonStyleChange('color', e.target.value)}
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
                        value={p.localProps.icon || ''}
                        onChange={(e) => p.handleChange('icon', e.target.value)}
                    />
                    <select
                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                        value={p.localProps.iconPos || 'start'}
                        onChange={(e) => p.handleChange('iconPos', e.target.value)}
                    >
                        <option value="start">Start</option>
                        <option value="end">End</option>
                    </select>
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Button Action</label>
                <select
                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                    value={resolvedActionType}
                    onChange={(e) => p.handleChange('actionType', e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="navigate">Navigate Page</option>
                    <option value="openPopup">Open Popup</option>
                </select>
            </div>

            {resolvedActionType === 'navigate' && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Link Page</label>
                    <select
                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                        value={p.localProps.pageSlug || ''}
                        onChange={(e) => p.handleChange('pageSlug', e.target.value)}
                    >
                        <option value="">No Link</option>
                        {p.pageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {resolvedActionType === 'openPopup' && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Popup Trigger</label>
                    <select
                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                        value={p.localProps.popupId || ''}
                        onChange={(e) => p.handleChange('popupId', e.target.value)}
                    >
                        <option value="">Select popup</option>
                        {p.popupOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {p.popupOptions.length === 0 ? (
                        <p className="text-[11px] text-gray-500">Create popups from the Pages tab first.</p>
                    ) : null}
                </div>
            )}
        </div>
    );
};
