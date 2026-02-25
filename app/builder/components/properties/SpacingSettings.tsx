import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const SpacingSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spacing</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Padding</label>
                    <Input
                        size="small"
                        placeholder="p-4 px-2 py-2 pt-1"
                        value={p.styles.padding}
                        onChange={(e) => p.handleStyleChange('padding', 'p-', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Margin</label>
                    <Input
                        size="small"
                        placeholder="m-4, m-[10px]"
                        value={p.styles.margin}
                        onChange={(e) => p.handleStyleChange('margin', 'm-', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
