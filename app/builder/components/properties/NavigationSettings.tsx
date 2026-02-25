import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import type { NodeProperties } from './useNodeProperties';

export const NavigationSettings = ({ p }: { p: NodeProperties }) => {
    const selectedNode = p.selectedNode;
    if (!selectedNode) return null;

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navigation</label>

            {selectedNode.type === 'Header' && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Brand</label>
                    <Input
                        size="small"
                        value={p.localProps.brand || ''}
                        onChange={(e) => p.handleChange('brand', e.target.value)}
                    />
                </div>
            )}

            {selectedNode.type === 'Footer' && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Copyright</label>
                    <Input
                        size="small"
                        value={p.localProps.copyrightText || ''}
                        onChange={(e) => p.handleChange('copyrightText', e.target.value)}
                    />
                </div>
            )}

            <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Menu Items</label>
                <button onClick={p.addMenuItem} className="text-blue-500 hover:text-blue-600">
                    <Plus size={14} />
                </button>
            </div>

            <div className="space-y-3">
                {p.getMenuItems().map((item, menuIndex) => (
                    <div key={item.id} className="rounded border border-gray-200 p-2 space-y-2">
                        <div className="flex items-center gap-1">
                            <Input
                                size="small"
                                placeholder="Menu label"
                                value={item.label}
                                onChange={(e) => p.updateMenuItem(menuIndex, 'label', e.target.value)}
                            />
                            <button onClick={() => p.removeMenuItem(menuIndex)} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">Link Page</label>
                            <select
                                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                value={item.pageSlug || '/'}
                                onChange={(e) => p.updateMenuItem(menuIndex, 'pageSlug', e.target.value)}
                            >
                                {p.pageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-400">Sub Menus</label>
                            <button onClick={() => p.addSubMenuItem(menuIndex)} className="text-blue-500 hover:text-blue-600">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {(item.children || []).map((child, childIndex) => (
                                <div key={child.id} className="rounded border border-gray-100 p-2 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Input
                                            size="small"
                                            placeholder="Submenu label"
                                            value={child.label}
                                            onChange={(e) => p.updateSubMenuItem(menuIndex, childIndex, 'label', e.target.value)}
                                        />
                                        <button onClick={() => p.removeSubMenuItem(menuIndex, childIndex)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <select
                                        className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                                        value={child.pageSlug || '/'}
                                        onChange={(e) => p.updateSubMenuItem(menuIndex, childIndex, 'pageSlug', e.target.value)}
                                    >
                                        {p.pageOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
