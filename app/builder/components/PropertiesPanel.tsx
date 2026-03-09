import React from 'react';
import { Typography } from '../../components/ui/Typography';
import { X } from 'lucide-react';
import { SecondaryPropertiesSections } from './properties/SecondaryPropertiesSections';
import { useNodeProperties } from './properties/useNodeProperties';

import { TabsSettings } from './properties/TabsSettings';
import { StepperSettings } from './properties/StepperSettings';
import { InputSettings } from './properties/InputSettings';
import { TypographySettings } from './properties/TypographySettings';
import { ButtonSettings } from './properties/ButtonSettings';
import { ContainerSettings } from './properties/ContainerSettings';
import { ImageSettings } from './properties/ImageSettings';
import { LayoutSizingSettings } from './properties/LayoutSizingSettings';
import { SpacingSettings } from './properties/SpacingSettings';
import { BordersSettings } from './properties/BordersSettings';
import { EffectsSettings } from './properties/EffectsSettings';
import { LinkSettings } from './properties/LinkSettings';

export const PropertiesPanel = () => {
    const p = useNodeProperties();
    const { selectedNode, localProps, dataGridProps, state } = p;

    if (!selectedNode) {
        return (
            <div className="ml-3 flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <Typography variant="body2" className="text-slate-500">
                    Select a component to edit properties.
                </Typography>
            </div>
        );
    }

    return (
        <div className="ml-3 flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm" >
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                <Typography variant="h6" className="font-semibold text-slate-900">
                    Properties
                </Typography>
                <div className="rounded bg-white px-2 py-1 text-xs text-slate-600 border border-slate-200">
                    {selectedNode.type}
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {selectedNode.type === 'Tabs' && <TabsSettings p={p} />}
                {selectedNode.type === 'Stepper' && <StepperSettings p={p} />}
                {selectedNode.type === 'Input' && <InputSettings p={p} />}

                {/* Global Style */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom CSS Style</label>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">Global Style</label>
                        <select
                            className="w-full rounded border border-slate-300 bg-white p-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                            value={localProps.customStyleId || ''}
                            onChange={(e) => p.handleCustomStyleChange(e.target.value)}
                        >
                            <option value="">None (use component defaults)</option>
                            {state.customStyles.map((style) => (
                                <option key={style.id} value={style.id}>
                                    {style.name} (.{style.className})
                                </option>
                            ))}
                        </select>
                    </div>
                    {state.customStyles.length === 0 && (
                        <p className="text-[11px] text-slate-500">
                            No global styles yet. Add them from the top toolbar.
                        </p>
                    )}
                </div>

                <LayoutSizingSettings p={p} />
                <SpacingSettings p={p} />
                <BordersSettings p={p} />
                <EffectsSettings p={p} />

                <TypographySettings p={p} />

                {selectedNode.type === 'Button' && <ButtonSettings p={p} />}
                {selectedNode.type === 'Link' && <LinkSettings p={p} />}
                {selectedNode.type === 'Container' && <ContainerSettings p={p} />}
                {selectedNode.type === 'Image' && <ImageSettings p={p} />}

                <SecondaryPropertiesSections
                    selectedNode={selectedNode}
                    localProps={localProps}
                    dataGridProps={dataGridProps}
                    handleChange={p.handleChange}
                    addOption={p.addOption}
                    handleOptionChange={p.handleOptionChange}
                    removeOption={p.removeOption}
                    handleDataGridChange={p.handleDataGridChange}
                    addDataGridColumn={p.addDataGridColumn}
                    updateDataGridColumn={p.updateDataGridColumn}
                    removeDataGridColumn={p.removeDataGridColumn}
                    parseCsvLabels={p.parseCsvLabels}
                    parseCsvNumbers={p.parseCsvNumbers}
                    getChartPointColors={p.getChartPointColors}
                    updateChartPointColor={p.updateChartPointColor}
                    handleNodeStyleChange={p.handleNodeStyleChange}
                />

                <div className="mt-8 border-t border-slate-200 pt-4">
                    <button
                        onClick={p.handleDelete}
                        className="flex w-full items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-600 transition hover:bg-red-100"
                    >
                        <X size={16} /> Delete Component
                    </button>
                </div>
            </div>
        </div >
    );
};
