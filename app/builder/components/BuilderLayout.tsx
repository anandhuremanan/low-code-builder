import React, { useEffect, useMemo, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    type DragEndEvent,
    type DragStartEvent
} from '@dnd-kit/core';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useBuilder } from '../context';
import { COMPONENT_REGISTRY } from '../registry';
import { type ComponentType, type SiteSectionKey } from '../types';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';

const PREVIEW_STORAGE_KEY = 'builder-preview-site';

type BuilderLayoutProps = {
    mode?: 'builder' | 'section';
    sectionTarget?: SiteSectionKey;
};

export const BuilderLayout = ({ mode = 'builder', sectionTarget }: BuilderLayoutProps) => {
    const { state, dispatch } = useBuilder();
    const [activeDragType, setActiveDragType] = useState<ComponentType | null>(null);
    const [isCustomStyleDialogOpen, setIsCustomStyleDialogOpen] = useState(false);
    const [customStyleName, setCustomStyleName] = useState('');
    const [customStyleClassName, setCustomStyleClassName] = useState('');
    const [customStyleCss, setCustomStyleCss] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (mode === 'builder' && state.editingTarget !== 'page') {
            dispatch({ type: 'SET_EDITING_TARGET', payload: { target: 'page' } });
            return;
        }

        if (mode === 'section' && sectionTarget && state.editingTarget !== sectionTarget) {
            dispatch({ type: 'SET_EDITING_TARGET', payload: { target: sectionTarget } });
        }
    }, [dispatch, mode, sectionTarget, state.editingTarget]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type as ComponentType;
        if (type) {
            setActiveDragType(type);
            dispatch({ type: 'SET_DRAGGED_COMPONENT', payload: { type } });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) dispatch({ type: 'REDO' });
                    else dispatch({ type: 'UNDO' });
                } else if (e.key === 'y') {
                    e.preventDefault();
                    dispatch({ type: 'REDO' });
                }
                return;
            }

            if (e.key === 'Delete' && state.selectedNodeId && state.selectedNodeId !== 'root-container') {
                e.preventDefault();
                dispatch({ type: 'DELETE_NODE', payload: { id: state.selectedNodeId } });
                dispatch({ type: 'SELECT_NODE', payload: { id: null } });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, state.selectedNodeId]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragType(null);
        dispatch({ type: 'SET_DRAGGED_COMPONENT', payload: { type: null } });
        if (!over) return;

        if (active.data.current?.isNew) {
            const type = active.data.current.type as ComponentType;
            const newId = `node-${Date.now()}`;
            const defaultProps = COMPONENT_REGISTRY[type]?.defaultProps || {};
            const clonedDefaultProps = JSON.parse(JSON.stringify(defaultProps));
            const initialChildren = type === 'Stepper' && Array.isArray(clonedDefaultProps.steps)
                ? clonedDefaultProps.steps.map((step: { label?: string }, index: number) => ({
                    id: `step-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
                    type: 'Container' as const,
                    props: {
                        className: 'p-4 border border-dashed border-gray-200 min-h-[100px]',
                        children: `Content for ${step?.label || `Step ${index + 1}`}`
                    },
                    children: []
                }))
                : [];

            const parentId = over.id === 'canvas-root' ? 'root-container' : String(over.id);
            dispatch({
                type: 'ADD_NODE',
                payload: {
                    parentId,
                    node: {
                        id: newId,
                        type,
                        props: clonedDefaultProps,
                        children: initialChildren
                    }
                }
            });
        } else {
            const nodeId = active.data.current?.nodeId as string | undefined;
            if (!nodeId) return;

            const newParentId = over.id === 'canvas-root' ? 'root-container' : String(over.id);
            dispatch({
                type: 'MOVE_NODE',
                payload: {
                    nodeId,
                    newParentId,
                    index: -1
                }
            });
        }
    };

    const handlePreview = () => {
        localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({
            pages: state.pages,
            currentPageId: state.currentPageId,
            viewMode: state.viewMode,
            customStyles: state.customStyles,
            siteSections: state.siteSections
        }));
        window.open('/builder/preview', '_blank', 'noopener,noreferrer');
    };

    const resetCustomStyleDialog = () => {
        setCustomStyleName('');
        setCustomStyleClassName('');
        setCustomStyleCss('');
    };

    const normalizeClassName = (value: string): string => value.trim().replace(/^\./, '');

    const handleAddCustomStyle = () => {
        const name = customStyleName.trim();
        const className = normalizeClassName(customStyleClassName);
        const css = customStyleCss.trim();
        if (!name || !className || !css) return;

        const duplicate = state.customStyles.some((style) => style.className === className || style.name === name);
        if (duplicate) return;

        dispatch({
            type: 'ADD_CUSTOM_STYLE',
            payload: {
                style: {
                    id: `custom-style-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    name,
                    className,
                    css
                }
            }
        });
        resetCustomStyleDialog();
    };

    const editingLabel = useMemo(() => {
        if (state.editingTarget === 'page') return 'Page';
        return state.editingTarget === 'header' ? 'Header' : 'Footer';
    }, [state.editingTarget]);

    return (
        <>
            {isClient ? (
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex h-screen w-full overflow-hidden">
                        <Sidebar showPages={mode === 'builder'} />
                        <div className="flex-1 min-w-0 flex flex-col relative">
                            <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">Builder</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Editing: {editingLabel}</span>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'desktop' } })}
                                        className={`p-1.5 rounded ${state.viewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'tablet' } })}
                                        className={`p-1.5 rounded ${state.viewMode === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="12" x2="12.01" y1="18" y2="18" /></svg>
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'mobile' } })}
                                        className={`p-1.5 rounded ${state.viewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="20" x="6" y="2" rx="2" /><path d="M12 18h.01" /></svg>
                                    </button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {mode === 'section' ? (
                                        <a href="/configure" className="text-sm border border-gray-300 px-3 py-1.5 rounded">
                                            Configure
                                        </a>
                                    ) : null}
                                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1 mr-2">
                                        <button
                                            onClick={() => dispatch({ type: 'UNDO' })}
                                            className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                            title="Undo (Ctrl+Z)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                                        </button>
                                        <button
                                            onClick={() => dispatch({ type: 'REDO' })}
                                            className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                            title="Redo (Ctrl+Y)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsCustomStyleDialogOpen(true)}
                                        className="text-sm border border-gray-300 px-3 py-1.5 rounded"
                                    >
                                        Global Styles
                                    </button>
                                    <button
                                        onClick={handlePreview}
                                        className="text-sm border border-gray-300 px-3 py-1.5 rounded"
                                    >
                                        Preview
                                    </button>
                                </div>
                            </header>
                            <Canvas />
                        </div>
                        <PropertiesPanel />
                    </div>

                    <DragOverlay>
                        {activeDragType ? (
                            <div className="p-2 bg-white rounded shadow-lg opacity-80 border border-blue-500">
                                {COMPONENT_REGISTRY[activeDragType].name}
                            </div>
                        ) : null}
                    </DragOverlay>

                    <Dialog
                        open={isCustomStyleDialogOpen}
                        title="Global Custom Styles"
                        onClose={() => {
                            setIsCustomStyleDialogOpen(false);
                            resetCustomStyleDialog();
                        }}
                        cancelText="Close"
                    >
                        <div className="space-y-4 min-w-[560px] max-w-[720px]">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Style Name</label>
                                <Input size="small" placeholder="Primary CTA" value={customStyleName} onChange={(e) => setCustomStyleName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CSS Class Name</label>
                                <Input size="small" placeholder="cta-primary" value={customStyleClassName} onChange={(e) => setCustomStyleClassName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CSS Code</label>
                                <Input
                                    multiline
                                    minRows={6}
                                    placeholder="background: #111827; color: #fff; border-radius: 10px;"
                                    value={customStyleCss}
                                    onChange={(e) => setCustomStyleCss(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddCustomStyle}
                                disabled={!customStyleName.trim() || !normalizeClassName(customStyleClassName) || !customStyleCss.trim()}
                                className="px-3 py-1.5 text-sm rounded border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Style
                            </button>

                            <div className="pt-2 border-t border-gray-200 space-y-2">
                                <Typography variant="body2" className="text-gray-700 font-medium">Added Styles</Typography>
                                {state.customStyles.length === 0 ? (
                                    <Typography variant="body2" className="text-gray-500 text-sm">No styles added yet.</Typography>
                                ) : (
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {state.customStyles.map((style) => (
                                            <div key={style.id} className="rounded border border-gray-200 p-2 flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900">{style.name}</div>
                                                    <div className="text-xs text-gray-500">.{style.className}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch({ type: 'REMOVE_CUSTOM_STYLE', payload: { id: style.id } })}
                                                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dialog>
                </DndContext>
            ) : (
                <div className="flex h-screen w-full overflow-hidden bg-gray-50 flex items-center justify-center">
                    Loading Builder...
                </div>
            )}
        </>
    );
};
