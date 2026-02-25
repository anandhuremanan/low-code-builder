import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

type SecondaryPropertiesSectionsProps = {
    selectedNode: any;
    localProps: Record<string, any>;
    dataGridProps: { apiUrl: string; columns: any[] };
    handleChange: (key: string, value: any) => void;
    addOption: () => void;
    handleOptionChange: (idx: number, field: 'label' | 'value', val: string) => void;
    removeOption: (idx: number) => void;
    handleDataGridChange: (key: 'apiUrl' | 'columns', value: any) => void;
    addDataGridColumn: () => void;
    updateDataGridColumn: (index: number, key: string, val: any) => void;
    removeDataGridColumn: (index: number) => void;
    parseCsvLabels: (raw: string) => string[];
    parseCsvNumbers: (raw: string) => number[];
    getChartPointColors: () => string[];
    updateChartPointColor: (index: number, value: string) => void;
    handleNodeStyleChange: (key: string, value: string) => void;
};

export const SecondaryPropertiesSections = ({
    selectedNode,
    localProps,
    dataGridProps,
    handleChange,
    addOption,
    handleOptionChange,
    removeOption,
    handleDataGridChange,
    addDataGridColumn,
    updateDataGridColumn,
    removeDataGridColumn,
    parseCsvLabels,
    parseCsvNumbers,
    getChartPointColors,
    updateChartPointColor,
    handleNodeStyleChange
}: SecondaryPropertiesSectionsProps) => {
    return (
        <>                {/* Content Section */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>

                {/* Children / Text Content */}
                {(selectedNode.type === 'Text' || selectedNode.type === 'Button') && (
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Text</label>
                        <Input
                            size="small"
                            value={localProps.children || ''}
                            onChange={(e) => handleChange('children', e.target.value)}
                        />
                    </div>
                )}



                {/* Select / MultiSelect / RadioGroup Options */}
                {(selectedNode.type === 'Select' || selectedNode.type === 'MultiSelect' || selectedNode.type === 'RadioGroup') && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-gray-400">Options</label>
                            <button onClick={addOption} className="text-blue-500 hover:text-blue-600"><Plus size={14} /></button>
                        </div>
                        <div className="space-y-2">
                            {localProps.options?.map((opt: any, idx: number) => (
                                <div key={idx} className="flex gap-1 items-center">
                                    <Input
                                        size="small"
                                        placeholder="Label"
                                        value={opt.label}
                                        onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                    />
                                    <Input
                                        size="small"
                                        placeholder="Value"
                                        value={opt.value}
                                        onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                                    />
                                    <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Grid Section */}
            {selectedNode.type === 'DataGrid' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data Grid</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">API URL</label>
                        <Input
                            size="small"
                            value={dataGridProps.apiUrl}
                            placeholder="https://api.example.com/data"
                            onChange={(e) => handleDataGridChange('apiUrl', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-gray-400">Columns</label>
                            <button onClick={addDataGridColumn} className="text-blue-500 hover:text-blue-600">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {dataGridProps.columns.map((col: any, idx: number) => (
                                <div key={idx} className="rounded border border-gray-100 p-2 space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Input
                                            size="small"
                                            placeholder="Header Name"
                                            value={col.headerName}
                                            onChange={(e) => updateDataGridColumn(idx, 'headerName', e.target.value)}
                                        />
                                        <button onClick={() => removeDataGridColumn(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400">Field Key</label>
                                            <Input
                                                size="small"
                                                placeholder="fieldKey"
                                                value={col.field}
                                                onChange={(e) => updateDataGridColumn(idx, 'field', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400">Width</label>
                                            <Input
                                                size="small"
                                                type="number"
                                                placeholder="150"
                                                value={col.width}
                                                onChange={(e) => updateDataGridColumn(idx, 'width', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {selectedNode.type === 'Charts' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Charts</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Title</label>
                        <Input
                            size="small"
                            value={localProps.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Chart Type</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={localProps.chartType || 'bar'}
                                onChange={(e) => handleChange('chartType', e.target.value)}
                            >
                                <option value="bar">Bar</option>
                                <option value="line">Line</option>
                                <option value="pie">Pie</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Data Source</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={localProps.dataSource || 'manual'}
                                onChange={(e) => handleChange('dataSource', e.target.value)}
                            >
                                <option value="manual">Manual</option>
                                <option value="api">API (JSON)</option>
                                <option value="json">JSON data</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Height</label>
                            <Input
                                size="small"
                                type="number"
                                value={localProps.height ?? 320}
                                onChange={(e) => handleChange('height', Number(e.target.value) || 320)}
                            />
                        </div>
                    </div>
                    {(localProps.dataSource || 'manual') === 'api' && (
                        <div className="space-y-2 rounded border border-gray-200 p-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">API URL</label>
                                <Input
                                    size="small"
                                    value={localProps.apiUrl || ''}
                                    onChange={(e) => handleChange('apiUrl', e.target.value)}
                                    placeholder="https://api.example.com/chart-data"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Data Path (optional)</label>
                                <Input
                                    size="small"
                                    value={localProps.dataPath || ''}
                                    onChange={(e) => handleChange('dataPath', e.target.value)}
                                    placeholder="data.items"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">X Axis Key</label>
                                    <Input
                                        size="small"
                                        value={localProps.xAxisKey || ''}
                                        onChange={(e) => handleChange('xAxisKey', e.target.value)}
                                        placeholder="month"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Y Axis Key</label>
                                    <Input
                                        size="small"
                                        value={localProps.yAxisKey || ''}
                                        onChange={(e) => handleChange('yAxisKey', e.target.value)}
                                        placeholder="sales"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Color Key (optional)</label>
                                <Input
                                    size="small"
                                    value={localProps.colorKey || ''}
                                    onChange={(e) => handleChange('colorKey', e.target.value)}
                                    placeholder="color"
                                />
                            </div>
                        </div>
                    )}
                    {(localProps.dataSource || 'manual') === 'json' && (
                        <div className="space-y-2 rounded border border-gray-200 p-2">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">JSON Payload</label>
                                <Input
                                    size="small"
                                    multiline
                                    minRows={6}
                                    value={localProps.jsonData || ''}
                                    onChange={(e) => handleChange('jsonData', e.target.value)}
                                    placeholder={'{"data":[{"month":"Jan","sales":120}]}'}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Data Path (optional)</label>
                                <Input
                                    size="small"
                                    value={localProps.dataPath || ''}
                                    onChange={(e) => handleChange('dataPath', e.target.value)}
                                    placeholder="data"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">X Axis Key</label>
                                    <Input
                                        size="small"
                                        value={localProps.xAxisKey || ''}
                                        onChange={(e) => handleChange('xAxisKey', e.target.value)}
                                        placeholder="month"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Y Axis Key</label>
                                    <Input
                                        size="small"
                                        value={localProps.yAxisKey || ''}
                                        onChange={(e) => handleChange('yAxisKey', e.target.value)}
                                        placeholder="sales"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Color Key (optional)</label>
                                <Input
                                    size="small"
                                    value={localProps.colorKey || ''}
                                    onChange={(e) => handleChange('colorKey', e.target.value)}
                                    placeholder="color"
                                />
                            </div>
                        </div>
                    )}
                    {(localProps.dataSource || 'manual') === 'manual' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Labels (comma separated)</label>
                                <Input
                                    size="small"
                                    multiline
                                    minRows={2}
                                    value={Array.isArray(localProps.labels) ? localProps.labels.join(', ') : ''}
                                    onChange={(e) => handleChange('labels', parseCsvLabels(e.target.value))}
                                    placeholder="Jan, Feb, Mar, Apr"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Values (comma separated)</label>
                                <Input
                                    size="small"
                                    multiline
                                    minRows={2}
                                    value={Array.isArray(localProps.values) ? localProps.values.join(', ') : ''}
                                    onChange={(e) => handleChange('values', parseCsvNumbers(e.target.value))}
                                    placeholder="12, 19, 8, 15"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Per Day Colors</label>
                                {(Array.isArray(localProps.labels) ? localProps.labels : []).map((label: string, idx: number) => (
                                    <div key={`${label}-${idx}`} className="flex items-center gap-2">
                                        <div className="w-24 text-[11px] text-gray-500 truncate" title={label || `Item ${idx + 1}`}>
                                            {label || `Item ${idx + 1}`}
                                        </div>
                                        <input
                                            type="color"
                                            value={getChartPointColors()[idx] || localProps.color || '#1976d2'}
                                            onChange={(e) => updateChartPointColor(idx, e.target.value)}
                                            className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                        />
                                        <Input
                                            size="small"
                                            value={getChartPointColors()[idx] || localProps.color || '#1976d2'}
                                            onChange={(e) => updateChartPointColor(idx, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                        <input
                            type="checkbox"
                            checked={Boolean(localProps.showLegend)}
                            onChange={(e) => handleChange('showLegend', e.target.checked)}
                        />
                        Show legend
                    </label>
                    {(localProps.chartType === 'bar' || localProps.chartType === 'line') && (
                        <>
                            <label className="flex items-center gap-2 text-xs text-gray-500">
                                <input
                                    type="checkbox"
                                    checked={Boolean(localProps.showGrid)}
                                    onChange={(e) => handleChange('showGrid', e.target.checked)}
                                />
                                Show grid
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">X Axis Label</label>
                                    <Input
                                        size="small"
                                        value={localProps.xAxisLabel || ''}
                                        onChange={(e) => handleChange('xAxisLabel', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Y Axis Label</label>
                                    <Input
                                        size="small"
                                        value={localProps.yAxisLabel || ''}
                                        onChange={(e) => handleChange('yAxisLabel', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {localProps.chartType === 'line' && (
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Line Curve</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={localProps.lineCurve || 'monotoneX'}
                                onChange={(e) => handleChange('lineCurve', e.target.value)}
                            >
                                <option value="linear">Linear</option>
                                <option value="monotoneX">Monotone</option>
                                <option value="step">Step</option>
                            </select>
                        </div>
                    )}
                    {localProps.chartType === 'pie' && (
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Inner Radius (donut)</label>
                            <Input
                                size="small"
                                type="number"
                                value={localProps.pieInnerRadius ?? 0}
                                onChange={(e) => handleChange('pieInnerRadius', Number(e.target.value) || 0)}
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={localProps.color || '#1976d2'}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                            />
                            <Input
                                size="small"
                                value={localProps.color || '#1976d2'}
                                onChange={(e) => handleChange('color', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Material Icon Section */}
            {selectedNode.type === 'MaterialIcon' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Icon Settings</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Icon Name</label>
                        <Input
                            size="small"
                            value={localProps.icon || ''}
                            placeholder="home, settings, favorite..."
                            onChange={(e) => handleChange('icon', e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400">
                            See <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-blue-500 underline">Material Icons</a>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Size</label>
                            <Input
                                size="small"
                                value={localProps.style?.fontSize || ''}
                                placeholder="40px"
                                onChange={(e) => handleNodeStyleChange('fontSize', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={localProps.style?.color || '#000000'}
                                    onChange={(e) => handleNodeStyleChange('color', e.target.value)}
                                    className="h-8 w-12 rounded border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                                <Input
                                    size="small"
                                    value={localProps.style?.color || '#000000'}
                                    onChange={(e) => handleNodeStyleChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Select / MultiSelect / RadioGroup Settings */}
            {(selectedNode.type === 'Select' || selectedNode.type === 'MultiSelect' || selectedNode.type === 'RadioGroup') && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Field Settings</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    {selectedNode.type === 'RadioGroup' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Value</label>
                                <Input
                                    size="small"
                                    value={localProps.value || ''}
                                    onChange={(e) => handleChange('value', e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-2 text-xs text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={Boolean(localProps.row)}
                                    onChange={(e) => handleChange('row', e.target.checked)}
                                />
                                Horizontal layout
                            </label>
                        </>
                    )}
                </div>
            )}

            {/* Date Picker Section */}
            {selectedNode.type === 'DatePicker' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Picker</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Helper Text</label>
                        <Input
                            size="small"
                            value={localProps.helperText || ''}
                            onChange={(e) => handleChange('helperText', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Form Name</label>
                        <Input
                            size="small"
                            value={localProps.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Time Picker Section */}
            {selectedNode.type === 'TimePicker' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time Picker</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Helper Text</label>
                        <Input
                            size="small"
                            value={localProps.helperText || ''}
                            onChange={(e) => handleChange('helperText', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Form Name</label>
                        <Input
                            size="small"
                            value={localProps.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Date Time Picker Section */}
            {selectedNode.type === 'DateTimePicker' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Time Picker</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Helper Text</label>
                        <Input
                            size="small"
                            value={localProps.helperText || ''}
                            onChange={(e) => handleChange('helperText', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Form Name</label>
                        <Input
                            size="small"
                            value={localProps.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Switch Section */}
            {selectedNode.type === 'Switch' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Switch</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Size</label>
                        <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            value={localProps.size || 'medium'}
                            onChange={(e) => handleChange('size', e.target.value)}
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-400">
                        <input
                            type="checkbox"
                            checked={Boolean(localProps.checked)}
                            onChange={(e) => handleChange('checked', e.target.checked)}
                        />
                        Checked
                    </label>
                </div>
            )}

            {/* Rating Section */}
            {selectedNode.type === 'Rating' && (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</label>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Label</label>
                        <Input
                            size="small"
                            value={localProps.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Value</label>
                            <Input
                                size="small"
                                type="number"
                                inputProps={{ step: '0.5', min: 0 }}
                                value={localProps.value ?? 0}
                                onChange={(e) => handleChange('value', Number(e.target.value || 0))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Max</label>
                            <Input
                                size="small"
                                type="number"
                                inputProps={{ step: '1', min: 1 }}
                                value={localProps.max ?? 5}
                                onChange={(e) => handleChange('max', Math.max(1, Number(e.target.value || 1)))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Precision</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={String(localProps.precision ?? 1)}
                                onChange={(e) => handleChange('precision', Number(e.target.value))}
                            >
                                <option value="1">1</option>
                                <option value="0.5">0.5</option>
                                <option value="0.25">0.25</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Size</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={localProps.size || 'medium'}
                                onChange={(e) => handleChange('size', e.target.value)}
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-400">
                        <input
                            type="checkbox"
                            checked={Boolean(localProps.readOnly)}
                            onChange={(e) => handleChange('readOnly', e.target.checked)}
                        />
                        Read only
                    </label>
                </div>
            )}
        </>
    );
};
