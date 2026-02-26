import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useBuilder } from '../context';
import { COMPONENT_REGISTRY } from '../registry';
import { type ComponentType } from '../types';
import { Plus, File, Layers, Search, Check, Pencil } from 'lucide-react';

const SidebarItem = ({ type }: { type: ComponentType }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-item-${type}`,
        data: {
            type,
            isNew: true, // Marker to indicate this is a new component being dragged
        },
    });

    const component = COMPONENT_REGISTRY[type];
    const Icon = component.icon;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
        flex items-center gap-3 p-3 mb-2 bg-white
        border border-gray-200 rounded-lg cursor-grab 
        hover:shadow-md transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
        >
            <div className="p-2 bg-gray-100 rounded-md">
                <Icon size={20} className="text-gray-600" />
            </div>
            <span className="font-medium text-sm text-gray-700">
                {component.name}
            </span>
        </div>
    );
};

export const Sidebar = ({ showPages = true }: { showPages?: boolean }) => {
    const { state, dispatch } = useBuilder();
    const [activeTab, setActiveTab] = useState<'components' | 'pages'>('components');
    const [newPageName, setNewPageName] = useState('');
    const [newPopupName, setNewPopupName] = useState('');
    const [renamingPopupId, setRenamingPopupId] = useState<string | null>(null);
    const [renamePopupValue, setRenamePopupValue] = useState('');
    const [componentSearch, setComponentSearch] = useState('');

    const filteredComponentTypes = Object.keys(COMPONENT_REGISTRY).filter((key) => {
        const entry = COMPONENT_REGISTRY[key as ComponentType];
        const query = componentSearch.trim().toLowerCase();
        if (!query) return true;

        return (
            key.toLowerCase().includes(query) ||
            entry.name.toLowerCase().includes(query)
        );
    });

    const handleAddPage = () => {
        if (newPageName.trim()) {
            dispatch({ type: 'ADD_PAGE', payload: { name: newPageName } });
            setNewPageName('');
        }
    };

    const handleAddPopup = () => {
        if (newPopupName.trim()) {
            dispatch({ type: 'ADD_POPUP', payload: { name: newPopupName.trim() } });
            setNewPopupName('');
        }
    };

    const startRenamePopup = (popupId: string, name: string) => {
        setRenamingPopupId(popupId);
        setRenamePopupValue(name);
    };

    const submitRenamePopup = () => {
        if (!renamingPopupId || !renamePopupValue.trim()) return;
        dispatch({
            type: 'RENAME_POPUP',
            payload: { id: renamingPopupId, name: renamePopupValue.trim() }
        });
        setRenamingPopupId(null);
        setRenamePopupValue('');
    };

    return (
        <div className="w-64 shrink-0 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('components')}
                    className={`py-3 text-sm font-medium flex items-center justify-center gap-2 ${showPages ? 'flex-1' : 'w-full'} ${activeTab === 'components' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                    <Layers size={16} /> Components
                </button>
                {showPages && (
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'pages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        <File size={16} /> Pages
                    </button>
                )}
            </div>

            {!showPages || activeTab === 'components' ? (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="relative mb-4">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={componentSearch}
                            onChange={(e) => setComponentSearch(e.target.value)}
                            placeholder="Search components..."
                            className="w-full text-sm border border-gray-300 rounded pl-8 pr-2 py-1.5 bg-white"
                        />
                    </div>
                    <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4">Elements</h2>
                    {filteredComponentTypes.length > 0 ? (
                        filteredComponentTypes.map((key) => (
                            <SidebarItem key={key} type={key as ComponentType} />
                        ))
                    ) : (
                        <p className="text-xs text-gray-500">No components found.</p>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">My Pages</h2>
                        <div className="space-y-2">
                            {state.pages.map(page => (
                                <div
                                    key={page.id}
                                    onClick={() => dispatch({ type: 'SWITCH_PAGE', payload: { id: page.id } })}
                                    className={`p-3 rounded-md cursor-pointer flex items-center justify-between group ${state.currentPageId === page.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200 hover:border-blue-300'}`}
                                >
                                    <span className={`text-sm font-medium ${state.currentPageId === page.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {page.name}
                                    </span>
                                    {state.currentPageId === page.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">New Page</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                placeholder="Page name..."
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                            />
                            <button
                                onClick={handleAddPage}
                                className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                                disabled={!newPageName.trim()}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">Popups</h2>
                        <div className="space-y-2 mb-3">
                            {state.popups.length === 0 && (
                                <p className="text-xs text-gray-500">No popups created yet.</p>
                            )}
                            {state.popups.map((popup) => {
                                const isEditingThisPopup = renamingPopupId === popup.id;
                                const isActivePopup = state.editingTarget === 'popup' && state.currentPopupId === popup.id;

                                return (
                                    <div
                                        key={popup.id}
                                        className={`p-2 rounded-md border ${isActivePopup ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                                    >
                                        {isEditingThisPopup ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={renamePopupValue}
                                                    onChange={(e) => setRenamePopupValue(e.target.value)}
                                                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={submitRenamePopup}
                                                    className="text-green-700 hover:text-green-800"
                                                    title="Save popup name"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className={`text-sm font-medium ${isActivePopup ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {popup.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => startRenamePopup(popup.id, popup.name)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="Rename popup"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: 'SWITCH_POPUP', payload: { id: popup.id } })}
                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                                        >
                                            Design Popup Content
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPopupName}
                                onChange={(e) => setNewPopupName(e.target.value)}
                                placeholder="Popup name..."
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                            />
                            <button
                                onClick={handleAddPopup}
                                className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                                disabled={!newPopupName.trim()}
                                title="Add popup"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
