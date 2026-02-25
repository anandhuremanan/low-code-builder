import React from 'react';
import type { NodeProperties } from './useNodeProperties';

export const EffectsSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Effects</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Shadow</label>
                    <select
                        className="w-full text-sm border rounded p-1"
                        value={p.effectState.shadow}
                        onChange={(e) => p.handleEffectChange('shadow', e.target.value)}
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
                        value={p.effectState.opacity}
                        onChange={(e) => p.handleEffectChange('opacity', e.target.value)}
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
    );
};
