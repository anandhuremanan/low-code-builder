import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';
import { isHexColor } from './styleHelpers';

export const BordersSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Borders</label>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Apply To</label>
                <select
                    className="w-full text-sm border rounded p-1"
                    value={p.borderSide}
                    onChange={(e) => p.setBorderSide(e.target.value as 'all' | 'top' | 'right' | 'bottom' | 'left')}
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
                        value={p.borderState.radius}
                        onChange={(e) => p.handleBorderChange('radius', e.target.value)}
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
                        value={p.borderState.width}
                        onChange={(e) => p.handleBorderChange('width', e.target.value)}
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
                            value={isHexColor(p.borderState.color) ? p.borderState.color : '#d1d5db'}
                            onChange={(e) => p.handleBorderChange('color', e.target.value)}
                            className="h-8 w-8 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                        />
                        <Input
                            size="small"
                            placeholder="#d1d5db"
                            value={p.borderState.color}
                            onChange={(e) => p.handleBorderChange('color', e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Style</label>
                    <select
                        className="w-full text-sm border rounded p-1"
                        value={p.borderState.style}
                        onChange={(e) => p.handleBorderChange('style', e.target.value)}
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
    );
};
