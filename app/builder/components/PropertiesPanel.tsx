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

export const PropertiesPanel = () => {
    const p = useNodeProperties();
    const { selectedNode, localProps, dataGridProps, state } = p;

    if (!selectedNode) {
        return (
            <div className="w-80 h-full bg-white border-l border-gray-200 p-4">
                <Typography variant="body2" className="text-gray-500">
                    Select a component to edit properties.
                </Typography>
            </div>
        );
    }

    return (
        <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col" >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <Typography variant="h6" className="font-semibold">
                    Properties
                </Typography>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedNode.type}
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {selectedNode.type === 'Tabs' && <TabsSettings p={p} />}
                {selectedNode.type === 'Stepper' && <StepperSettings p={p} />}
                {selectedNode.type === 'Input' && <InputSettings p={p} />}

                {/* Global Style */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom CSS Style</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Global Style</label>
                        <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
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
                        <p className="text-[11px] text-gray-500">
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

                <div className="border-t border-gray-200 pt-4 mt-8">
                    <button
                        onClick={p.handleDelete}
                        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center justify-center gap-2 transition-colors border border-red-200"
                    >
                        <X size={16} /> Delete Component
                    </button>
                </div>
            </div>
        </div >
    );
};
