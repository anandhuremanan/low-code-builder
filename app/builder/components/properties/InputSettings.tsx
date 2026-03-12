import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const InputSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Settings</label>
            <div className="space-y-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Label</label>
                    <Input
                        size="small"
                        value={p.localProps.label || ''}
                        onChange={(e) => p.handleChange('label', e.target.value)}
                        placeholder="Input Label"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Type</label>
                    <select
                        className="w-full text-sm border rounded p-1"
                        value={p.localProps.type || 'text'}
                        onChange={(e) => p.handleChange('type', e.target.value)}
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
                        value={p.localProps.placeholder || ''}
                        onChange={(e) => p.handleChange('placeholder', e.target.value)}
                        placeholder="Placeholder text"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Field Name</label>
                    <Input
                        size="small"
                        value={p.localProps.name || ''}
                        onChange={(e) => p.handleChange('name', e.target.value)}
                        placeholder="email"
                    />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                        type="checkbox"
                        checked={Boolean(p.localProps.required)}
                        onChange={(e) => p.handleChange('required', e.target.checked)}
                    />
                    Required
                </label>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Regex Pattern</label>
                    <Input
                        size="small"
                        value={p.localProps.regexPattern || ''}
                        onChange={(e) => p.handleChange('regexPattern', e.target.value)}
                        placeholder="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Regex Validation Trigger</label>
                    <select
                        className="w-full text-sm border rounded p-1"
                        value={p.localProps.regexValidationTrigger || 'onSubmit'}
                        onChange={(e) => p.handleChange('regexValidationTrigger', e.target.value)}
                    >
                        <option value="onSubmit">Parent Form Submit</option>
                        <option value="onKeydown">onKeydown</option>
                        <option value="onBlur">onBlur</option>
                        <option value="onInput">onInput</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Regex Error Message</label>
                    <Input
                        size="small"
                        value={p.localProps.regexErrorMessage || ''}
                        onChange={(e) => p.handleChange('regexErrorMessage', e.target.value)}
                        placeholder="Please enter a valid value."
                    />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                        type="checkbox"
                        checked={Boolean(p.localProps.disableBorder)}
                        onChange={(e) => p.handleChange('disableBorder', e.target.checked)}
                    />
                    Disable Border
                </label>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Background Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={p.localProps.style?.backgroundColor || '#ffffff'}
                            onChange={(e) => p.handleNodeStyleChange('backgroundColor', e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.style?.backgroundColor || '#ffffff'}
                            onChange={(e) => p.handleNodeStyleChange('backgroundColor', e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Label Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={p.localProps.labelColor || '#374151'}
                            onChange={(e) => p.handleChange('labelColor', e.target.value)}
                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            value={p.localProps.labelColor || '#374151'}
                            onChange={(e) => p.handleChange('labelColor', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="h-px bg-gray-200 my-4" />
        </div>
    );
};
