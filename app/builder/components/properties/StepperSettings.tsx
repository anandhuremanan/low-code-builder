import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import type { NodeProperties } from './useNodeProperties';

export const StepperSettings = ({ p }: { p: NodeProperties }) => {
    const selectedNode = p.selectedNode;
    if (!selectedNode) return null;

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stepper Settings</label>
            <div className="space-y-2">
                {p.getStepperItems().map((step, index) => (
                    <div key={`${step.label}-${index}`} className="rounded border border-gray-200 p-2 space-y-2">
                        <div className="flex gap-2 items-center">
                            <Input
                                size="small"
                                value={step.label}
                                onChange={(e) => p.updateStepperItem(index, 'label', e.target.value)}
                                placeholder="Step label"
                                className="flex-1"
                            />
                            <button
                                onClick={() => p.removeStepperItem(index)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                                disabled={p.getStepperItems().length <= 1}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                            <input
                                type="checkbox"
                                checked={Boolean(step.optional)}
                                onChange={(e) => p.updateStepperItem(index, 'optional', e.target.checked)}
                            />
                            Optional step
                        </label>
                    </div>
                ))}
                <button
                    onClick={p.addStepperItem}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                    <Plus size={14} />
                    Add Step
                </button>
                {(selectedNode.children?.length || 0) < p.getStepperItems().length && (
                    <button
                        onClick={() => p.ensureStepperStepContainers(p.getStepperItems())}
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
                        value={p.localProps.activeStep ?? 0}
                        onChange={(e) => p.handleChange('activeStep', Number(e.target.value))}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Orientation</label>
                    <select
                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                        value={p.localProps.orientation || 'horizontal'}
                        onChange={(e) => p.handleChange('orientation', e.target.value)}
                    >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                    </select>
                </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                    type="checkbox"
                    checked={Boolean(p.localProps.linear)}
                    onChange={(e) => p.handleChange('linear', e.target.checked)}
                />
                Linear flow
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                    type="checkbox"
                    checked={Boolean(p.localProps.alternativeLabel)}
                    onChange={(e) => p.handleChange('alternativeLabel', e.target.checked)}
                />
                Alternative labels (horizontal only)
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                    type="checkbox"
                    checked={Boolean(p.localProps.showStatusText)}
                    onChange={(e) => p.handleChange('showStatusText', e.target.checked)}
                />
                Show status text
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                    type="checkbox"
                    checked={Boolean(p.localProps.showControls)}
                    onChange={(e) => p.handleChange('showControls', e.target.checked)}
                />
                Show controls
            </label>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Back Label</label>
                    <Input
                        size="small"
                        value={p.localProps.backLabel || ''}
                        onChange={(e) => p.handleChange('backLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Next Label</label>
                    <Input
                        size="small"
                        value={p.localProps.nextLabel || ''}
                        onChange={(e) => p.handleChange('nextLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Skip Label</label>
                    <Input
                        size="small"
                        value={p.localProps.skipLabel || ''}
                        onChange={(e) => p.handleChange('skipLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Finish Label</label>
                    <Input
                        size="small"
                        value={p.localProps.finishLabel || ''}
                        onChange={(e) => p.handleChange('finishLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Reset Label</label>
                    <Input
                        size="small"
                        value={p.localProps.resetLabel || ''}
                        onChange={(e) => p.handleChange('resetLabel', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Step Prefix</label>
                    <Input
                        size="small"
                        value={p.localProps.stepPrefixText || ''}
                        onChange={(e) => p.handleChange('stepPrefixText', e.target.value)}
                        placeholder="Step"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-gray-400">Completed Text</label>
                <Input
                    size="small"
                    value={p.localProps.completedText || ''}
                    onChange={(e) => p.handleChange('completedText', e.target.value)}
                />
            </div>

            <div className="h-px bg-gray-200 my-4" />
        </div>
    );
};
