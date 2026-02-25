import React from 'react';
import { Input } from '../../../components/ui/Input';
import type { NodeProperties } from './useNodeProperties';

export const ContainerSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Container Style</label>
            <div className="space-y-1">
                <label className="text-xs text-gray-400">Content Flow</label>
                <select
                    className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                    value={p.getContainerFlow()}
                    onChange={(e) => p.handleContainerFlowChange(e.target.value as 'block' | 'column' | 'row' | 'row-wrap')}
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
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Horizontal</label>
                    <select
                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                        value={p.localProps.style?.justifyContent || 'flex-start'}
                        onChange={(e) => p.handleContainerAlignmentChange('horizontal', e.target.value)}
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
                        value={p.localProps.style?.alignItems || 'flex-start'}
                        onChange={(e) => p.handleContainerAlignmentChange('vertical', e.target.value)}
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
    );
};
