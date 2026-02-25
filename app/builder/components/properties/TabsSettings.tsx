import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import type { NodeProperties } from './useNodeProperties';

export const TabsSettings = ({ p }: { p: NodeProperties }) => {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tabs Management</label>
            <div className="space-y-2">
                {p.getTabsItems().map((item, index) => (
                    <div key={item.id || index} className="flex gap-2 items-center">
                        <Input
                            size="small"
                            value={item.label}
                            onChange={(e) => p.updateTabItem(index, e.target.value)}
                            placeholder="Tab Label"
                            className="flex-1"
                        />
                        <button
                            onClick={() => p.removeTabItem(index)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                            disabled={p.getTabsItems().length <= 1}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={p.addTabItem}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                    <Plus size={14} />
                    Add Tab
                </button>
            </div>
            <div className="h-px bg-gray-200 my-4" />
        </div>
    );
};
