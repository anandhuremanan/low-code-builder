
import React, { useState, useEffect } from 'react';
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
import { type ComponentType } from '../types';

export const BuilderLayout = () => {
    const { state, dispatch } = useBuilder();
    const [activeDragType, setActiveDragType] = useState<ComponentType | null>(null);
    const PREVIEW_STORAGE_KEY = 'builder-preview-site';

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Must drag 10px to start (prevents accidental clicks)
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
            // Check if user is typing in an input/textarea to avoid triggering undo/redo
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        dispatch({ type: 'REDO' });
                    } else {
                        dispatch({ type: 'UNDO' });
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    dispatch({ type: 'REDO' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragType(null);
        dispatch({ type: 'SET_DRAGGED_COMPONENT', payload: { type: null } });

        if (!over) return;

        // Verify if we are dropping a new component from sidebar
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

            // Logic to determine parent.
            let parentId: string | null = null;
            const shouldForceRootParent = type === 'Footer';

            if (shouldForceRootParent) {
                parentId = 'root-container';
            } else {
                // If dropping on 'canvas-root', or if we default to root
                if (over.id === 'canvas-root') {
                    parentId = 'root-container';
                } else {
                    // If over.id is NOT canvas-root, it means we dropped ON a container
                    // We trust over.id is the container ID
                    parentId = over.id as string;
                }
            }

            if (parentId) {
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
            }
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
            viewMode: state.viewMode
        }));
        window.open('/builder/preview', '_blank', 'noopener,noreferrer');
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col relative">
                    {/* Header / Toolbar could go here */}
                    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
                        <span className="font-bold">Builder</span>
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
        </DndContext>
    );
};
