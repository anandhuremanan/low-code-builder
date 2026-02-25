import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const ImageSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image</label>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Image URL</label>
                <Input
                    size="small"
                    value={p.localProps.src || ''}
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => p.handleChange('src', e.target.value)}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Upload</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => p.handleImageUpload(e.target.files?.[0] || null)}
                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Alt Text</label>
                <Input
                    size="small"
                    value={p.localProps.alt || ''}
                    onChange={(e) => p.handleChange('alt', e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Width (px)</label>
                    <Input
                        size="small"
                        type="number"
                        value={(p.localProps.style?.width || '').toString().replace('px', '')}
                        onChange={(e) => p.handleImageSizeChange('width', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Height (px)</label>
                    <Input
                        size="small"
                        type="number"
                        value={(p.localProps.style?.height || '').toString().replace('px', '')}
                        onChange={(e) => p.handleImageSizeChange('height', e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Object Fit</label>
                <select
                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                    value={p.styles.objectFit || ''}
                    onChange={(e) => p.handleStyleChange('objectFit', 'object-', e.target.value)}
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
    );
};
