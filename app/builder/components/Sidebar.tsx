import React, { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useBuilder } from '../context';
import { COMPONENT_REGISTRY } from '../registry';
import { type ComponentType } from '../types';
import { Plus, File, Layers, Search, Check, Pencil, ChevronDown } from 'lucide-react';

const COMPONENT_CATEGORY_ORDER = ['layout', 'basic', 'input', 'data'] as const;

const COMPONENT_CATEGORY_LABELS: Record<(typeof COMPONENT_CATEGORY_ORDER)[number], string> = {
    layout: 'Layout',
    basic: 'Basic',
    input: 'Input',
    data: 'Data Display',
};

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
        element-box
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
        >
            <div className="">
                <Icon size={20} className="text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">
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
    const [openCategories, setOpenCategories] = useState<Record<(typeof COMPONENT_CATEGORY_ORDER)[number], boolean>>({
        layout: true,
        basic: false,
        input: false,
        data: false,
    });

    const filteredComponentTypes = Object.keys(COMPONENT_REGISTRY).filter((key) => {
        const entry = COMPONENT_REGISTRY[key as ComponentType];
        const query = componentSearch.trim().toLowerCase();
        if (!query) return true;

        return (
            key.toLowerCase().includes(query) ||
            entry.name.toLowerCase().includes(query)
        );
    });

    const groupedComponents = useMemo(() => {
        return COMPONENT_CATEGORY_ORDER.map((category) => ({
            category,
            label: COMPONENT_CATEGORY_LABELS[category],
            items: filteredComponentTypes.filter((key) => COMPONENT_REGISTRY[key as ComponentType].category === category),
        })).filter((group) => group.items.length > 0);
    }, [filteredComponentTypes]);

    const isSearching = componentSearch.trim().length > 0;

    const toggleCategory = (category: (typeof COMPONENT_CATEGORY_ORDER)[number]) => {
        setOpenCategories((current) => ({
            ...current,
            [category]: !current[category],
        }));
    };

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
        <div className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70">
                <button
                    onClick={() => setActiveTab('components')}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-medium ${showPages ? 'flex-1' : 'w-full'} ${activeTab === 'components' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}
                >
                    <Layers size={16} /> Components
                </button>
                {showPages && (
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'pages' ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                        <File size={16} /> Pages
                    </button>
                )}
            </div>

            {!showPages || activeTab === 'components' ? (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="relative mb-4">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={componentSearch}
                            onChange={(e) => setComponentSearch(e.target.value)}
                            placeholder="Search components..."
                            className="Elements"
                        />
                    </div>
                    <h2 className="mb-4 text-xs font-semibold uppercase text-slate-500">Elements</h2>
                    {groupedComponents.length > 0 ? (
                        <div className="space-y-3">
                            {groupedComponents.map((group) => {
                                const isOpen = isSearching ? true : openCategories[group.category];

                                return (
                                    <div key={group.category} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60">
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(group.category)}
                                            className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-slate-100/80"
                                            aria-expanded={isOpen}
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">{group.label}</div>
                                                <div className="text-xs text-slate-500">{group.items.length} component{group.items.length === 1 ? '' : 's'}</div>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isOpen ? (
                                            <div className="border-t border-slate-200 bg-white p-2 elements-group">
                                                {group.items.map((key) => (
                                                    <SidebarItem key={key} type={key as ComponentType} />
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No components found.</p>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                        <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">My Pages</h2>
                        <div className="space-y-2">
                            {state.pages.map(page => (
                                <div
                                    key={page.id}
                                    onClick={() => dispatch({ type: 'SWITCH_PAGE', payload: { id: page.id } })}
                                    className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 ${state.currentPageId === page.id ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                                >
                                    <span className={`text-sm font-medium ${state.currentPageId === page.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {page.name}
                                    </span>
                                    {state.currentPageId === page.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">New Page</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                placeholder="Page name..."
                                className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleAddPage}
                                className="rounded-lg bg-blue-600 p-1 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!newPageName.trim()}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Popups</h2>
                        <div className="space-y-2 mb-3">
                            {state.popups.length === 0 && (
                                <p className="text-xs text-slate-500">No popups created yet.</p>
                            )}
                            {state.popups.map((popup) => {
                                const isEditingThisPopup = renamingPopupId === popup.id;
                                const isActivePopup = state.editingTarget === 'popup' && state.currentPopupId === popup.id;

                                return (
                                    <div
                                        key={popup.id}
                                        className={`rounded-lg border p-2 ${isActivePopup ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}
                                    >
                                        {isEditingThisPopup ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={renamePopupValue}
                                                    onChange={(e) => setRenamePopupValue(e.target.value)}
                                                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
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
                                                <span className={`text-sm font-medium ${isActivePopup ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {popup.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => startRenamePopup(popup.id, popup.name)}
                                                    className="text-slate-500 hover:text-slate-700"
                                                    title="Rename popup"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: 'SWITCH_POPUP', payload: { id: popup.id } })}
                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-50"
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
                                className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleAddPopup}
                                className="rounded-lg bg-blue-600 p-1 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
