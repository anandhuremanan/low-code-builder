import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const LayoutSizingSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layout & Sizing</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Width</label>
                    <Input
                        size="small"
                        placeholder="w-full, w-[100px]"
                        value={p.styles.width}
                        onChange={(e) => p.handleStyleChange('width', 'w-', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Height</label>
                    <Input
                        size="small"
                        placeholder="h-full, h-[100px]"
                        value={p.styles.height}
                        onChange={(e) => p.handleStyleChange('height', 'h-', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
