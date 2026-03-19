import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Code2 } from 'lucide-react';
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
import { generatePageComponentCode, generateSectionComponentCode } from '../codegen';
import { normalizeAiPagePayload } from '../ai';

const PREVIEW_STORAGE_KEY = 'builder-preview-site';

type BuilderLayoutProps = {
    mode?: 'builder' | 'section';
    sectionTarget?: SiteSectionKey;
};

export const BuilderLayout = ({ mode = 'builder', sectionTarget }: BuilderLayoutProps) => {
    const { state, dispatch } = useBuilder();
    const [activeDragType, setActiveDragType] = useState<ComponentType | null>(null);
    const [copiedNode, setCopiedNode] = useState<any | null>(null);
    const [isCustomStyleDialogOpen, setIsCustomStyleDialogOpen] = useState(false);
    const [customStyleName, setCustomStyleName] = useState('');
    const [customStyleClassName, setCustomStyleClassName] = useState('');
    const [customStyleCss, setCustomStyleCss] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedFileName, setGeneratedFileName] = useState('');
    const [generatedCodeSourceLabel, setGeneratedCodeSourceLabel] = useState('');
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiMode, setAiMode] = useState<'generate' | 'edit'>('generate');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiError, setAiError] = useState('');
    const [aiResultJson, setAiResultJson] = useState('');
    const [isAiSubmitting, setIsAiSubmitting] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (mode === 'builder' && state.editingTarget !== 'page' && state.editingTarget !== 'popup') {
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

    const getActiveNodes = () => {
        const currentPage = state.pages.find((p) => p.id === state.currentPageId);
        const currentPopup = state.popups.find((popup) => popup.id === state.currentPopupId);
        if (state.editingTarget === 'page') return currentPage?.nodes || [];
        if (state.editingTarget === 'popup') return currentPopup?.nodes || [];
        return state.siteSections[state.editingTarget].nodes;
    };

    const currentPage = state.pages.find((page) => page.id === state.currentPageId) || null;

    const findNodeAndParent = (
        nodes: any[],
        nodeId: string,
        parentId: string | null = null
    ): { node: any | null; parentId: string | null } => {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return { node, parentId };
            }
            if (node.children?.length) {
                const found = findNodeAndParent(node.children, nodeId, node.id);
                if (found.node) return found;
            }
        }
        return { node: null, parentId: null };
    };

    const cloneNodeWithFreshIds = (node: any): any => ({
        ...node,
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        props: JSON.parse(JSON.stringify(node.props || {})),
        children: Array.isArray(node.children) ? node.children.map(cloneNodeWithFreshIds) : []
    });

    const copySelectedNode = () => {
        if (!state.selectedNodeId || state.selectedNodeId === 'root-container') return;
        const activeNodes = getActiveNodes();
        const { node } = findNodeAndParent(activeNodes, state.selectedNodeId);
        if (!node) return;
        setCopiedNode(JSON.parse(JSON.stringify(node)));
    };

    const pasteCopiedNode = () => {
        if (!copiedNode) return;
        const activeNodes = getActiveNodes();
        let targetParentId = 'root-container';

        if (state.selectedNodeId) {
            const { node: selectedNode, parentId } = findNodeAndParent(activeNodes, state.selectedNodeId);
            if (selectedNode?.type === 'Container') {
                targetParentId = selectedNode.id;
            } else if (parentId) {
                targetParentId = parentId;
            }
        }

        const clonedNode = cloneNodeWithFreshIds(copiedNode);
        dispatch({
            type: 'ADD_NODE',
            payload: {
                parentId: targetParentId,
                node: clonedNode
            }
        });
        dispatch({ type: 'SELECT_NODE', payload: { id: clonedNode.id } });
    };

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
                } else if (e.key === 'c') {
                    e.preventDefault();
                    copySelectedNode();
                } else if (e.key === 'v') {
                    e.preventDefault();
                    pasteCopiedNode();
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
    }, [dispatch, state.selectedNodeId, copiedNode, state.currentPageId, state.currentPopupId, state.editingTarget, state.pages, state.popups, state.siteSections]);

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
            popups: state.popups,
            currentPageId: state.currentPageId,
            currentPopupId: state.currentPopupId,
            viewMode: state.viewMode,
            customStyles: state.customStyles,
            siteSections: state.siteSections
        }));
        window.open('/builder/preview', '_blank', 'noopener,noreferrer');
    };

    const openAiDialog = (mode: 'generate' | 'edit') => {
        setAiMode(mode);
        setAiPrompt('');
        setAiError('');
        setAiResultJson('');
        setIsAiDialogOpen(true);
    };

    const handleAiSubmit = async () => {
        if (!currentPage || !aiPrompt.trim()) return;

        setIsAiSubmitting(true);
        setAiError('');

        try {
            const response = await fetch('/api/builder-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: aiMode,
                    prompt: aiPrompt.trim(),
                    currentPage: aiMode === 'edit'
                        ? {
                            name: currentPage.name,
                            slug: currentPage.slug,
                            nodes: currentPage.nodes
                        }
                        : undefined
                })
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'AI request failed.');
            }

            const normalizedPage = normalizeAiPagePayload(payload.page, currentPage);
            dispatch({
                type: 'IMPORT_PAGE',
                payload: normalizedPage
            });
            setAiResultJson(JSON.stringify(normalizedPage, null, 2));
        } catch (error) {
            setAiError(error instanceof Error ? error.message : 'AI request failed.');
        } finally {
            setIsAiSubmitting(false);
        }
    };

    const handleGenerateSectionCode = async () => {
        if (mode !== 'section' || !sectionTarget || (sectionTarget !== 'header' && sectionTarget !== 'footer')) {
            return;
        }

        const code = generateSectionComponentCode({
            section: sectionTarget,
            nodes: state.siteSections[sectionTarget].nodes,
            customStyles: state.customStyles
        });

        setGeneratedCode(code);
        setGeneratedFileName(sectionTarget === 'header' ? 'GeneratedHeader.tsx' : 'GeneratedFooter.tsx');
        setGeneratedCodeSourceLabel(sectionTarget);
        setIsCodeDialogOpen(true);
    };

    const handleGeneratePageCode = async () => {
        const currentPage = state.pages.find((page) => page.id === state.currentPageId);
        if (!currentPage) return;

        const { code, fileName } = generatePageComponentCode({
            pageName: currentPage.name,
            pageSlug: currentPage.slug,
            nodes: currentPage.nodes,
            customStyles: state.customStyles
        });

        setGeneratedCode(code);
        setGeneratedFileName(fileName);
        setGeneratedCodeSourceLabel(currentPage.name || 'page');
        setIsCodeDialogOpen(true);
    };

    const handleDownloadGeneratedCode = () => {
        if (!generatedCode || !generatedFileName) return;
        const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = generatedFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleCopyGeneratedCode = async () => {
        if (!generatedCode || !navigator.clipboard) return;
        await navigator.clipboard.writeText(generatedCode);
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
        if (state.editingTarget === 'popup') {
            const popup = state.popups.find((item) => item.id === state.currentPopupId);
            return popup ? `Popup: ${popup.name}` : 'Popup';
        }
        if (state.editingTarget === 'header') return 'Header';
        if (state.editingTarget === 'footer') return 'Footer';
        if (state.editingTarget === 'sidebarLeft') return 'Sidebar Left';
        return 'Sidebar Right';
    }, [state.currentPopupId, state.editingTarget, state.popups]);

    const toolbarIconClass = "p-1.5 rounded-md text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700";
    const toolbarIconActiveClass = "bg-white text-slate-800 shadow-sm";
    const toolbarActionClass = "inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";
    const toolbarIconButtonClass = "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";
    const canGenerateSectionCode = mode === 'section' && (sectionTarget === 'header' || sectionTarget === 'footer');
    const canGeneratePageCode = mode === 'builder' && state.editingTarget === 'page';

    return (
        <>
            {isClient ? (
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white p-3">
                        <Sidebar showPages={mode === 'builder'} />
                        <div className="relative ml-3 flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">Builder</span>
                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-500">Editing: {editingLabel}</span>
                                </div>
                                <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'desktop' } })}
                                        className={`${toolbarIconClass} ${state.viewMode === 'desktop' ? toolbarIconActiveClass : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'tablet' } })}
                                        className={`${toolbarIconClass} ${state.viewMode === 'tablet' ? toolbarIconActiveClass : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="12" x2="12.01" y1="18" y2="18" /></svg>
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: { mode: 'mobile' } })}
                                        className={`${toolbarIconClass} ${state.viewMode === 'mobile' ? toolbarIconActiveClass : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="20" x="6" y="2" rx="2" /><path d="M12 18h.01" /></svg>
                                    </button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {mode === 'section' ? (
                                        <a href="/configure" className={toolbarActionClass}>
                                            Configure
                                        </a>
                                    ) : null}
                                    <div className="mr-2 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                                        <button
                                            onClick={() => dispatch({ type: 'UNDO' })}
                                            className={toolbarIconClass}
                                            title="Undo (Ctrl+Z)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
                                        </button>
                                        <button
                                            onClick={() => dispatch({ type: 'REDO' })}
                                            className={toolbarIconClass}
                                            title="Redo (Ctrl+Y)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
                                        </button>
                                        <button
                                            onClick={copySelectedNode}
                                            disabled={!state.selectedNodeId || state.selectedNodeId === 'root-container'}
                                            className={`${toolbarIconClass} disabled:cursor-not-allowed disabled:opacity-40`}
                                            title="Copy (Ctrl+C)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        </button>
                                        <button
                                            onClick={pasteCopiedNode}
                                            disabled={!copiedNode}
                                            className={`${toolbarIconClass} disabled:cursor-not-allowed disabled:opacity-40`}
                                            title="Paste (Ctrl+V)"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14H5" /><path d="M7 12v4" /></svg>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsCustomStyleDialogOpen(true)}
                                        className={toolbarActionClass}
                                    >
                                        Global Styles
                                    </button>
                                    {canGeneratePageCode ? (
                                        <button
                                            onClick={() => openAiDialog('generate')}
                                            className={toolbarIconButtonClass}
                                            title="AI page actions"
                                            aria-label="AI page actions"
                                        >
                                            <Bot size={18} />
                                        </button>
                                    ) : null}
                                    {canGeneratePageCode ? (
                                        <button
                                            onClick={handleGeneratePageCode}
                                            className={toolbarIconButtonClass}
                                            title="Generate React code"
                                            aria-label="Generate React code"
                                        >
                                            <Code2 size={18} />
                                        </button>
                                    ) : null}
                                    {canGenerateSectionCode ? (
                                        <button
                                            onClick={handleGenerateSectionCode}
                                            className={toolbarIconButtonClass}
                                            title="Generate React code"
                                            aria-label="Generate React code"
                                        >
                                            <Code2 size={18} />
                                        </button>
                                    ) : null}
                                    <button
                                        onClick={handlePreview}
                                        className={toolbarActionClass}
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
                        <div className="w-[640px] max-w-full space-y-4 pt-1">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Style Name</label>
                                <Input size="small" placeholder="Primary CTA" value={customStyleName} onChange={(e) => setCustomStyleName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">CSS Class Name</label>
                                <Input size="small" placeholder="cta-primary" value={customStyleClassName} onChange={(e) => setCustomStyleClassName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">CSS Code</label>
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
                                className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add Style
                            </button>

                            <div className="space-y-2 border-t border-slate-200 pt-3">
                                <Typography variant="body2" className="font-medium text-slate-700">Added Styles</Typography>
                                {state.customStyles.length === 0 ? (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                                        <Typography variant="body2" className="text-sm text-slate-500">No styles added yet.</Typography>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {state.customStyles.map((style) => (
                                            <div key={style.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-slate-900">{style.name}</div>
                                                    <div className="text-xs text-slate-500">.{style.className}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch({ type: 'REMOVE_CUSTOM_STYLE', payload: { id: style.id } })}
                                                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
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

                    <Dialog
                        open={isAiDialogOpen}
                        title={aiMode === 'generate' ? 'AI Generate Page' : 'AI Edit Page'}
                        onClose={() => {
                            if (isAiSubmitting) return;
                            setIsAiDialogOpen(false);
                        }}
                        cancelText="Close"
                    >
                        <div className="w-[900px] max-w-full space-y-4 pt-1">
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setAiMode('generate')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${aiMode === 'generate'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Generate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAiMode('edit')}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${aiMode === 'edit'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Edit Existing
                                </button>
                            </div>
                            <Typography variant="body2" className="text-sm text-slate-500">
                                {aiMode === 'generate'
                                    ? 'Describe the page you want. The result will replace the current page and remain editable in the drag-and-drop builder.'
                                    : 'Describe the changes you want. The current page JSON will be sent to the model and the returned version will replace the canvas.'}
                            </Typography>
                            <Input
                                multiline
                                minRows={8}
                                placeholder={aiMode === 'generate'
                                    ? 'Example: Create a SaaS landing page with hero, pricing cards, testimonial section, and contact form.'
                                    : 'Example: Add a testimonial carousel under pricing, change the hero CTA text, and add a newsletter signup in the footer area of the page.'}
                                value={aiPrompt}
                                onChange={(event) => setAiPrompt(event.target.value)}
                            />
                            {aiError ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {aiError}
                                </div>
                            ) : null}
                            <div className="flex items-center justify-between gap-3">
                                <Typography variant="body2" className="text-xs text-slate-500">
                                    {currentPage ? `Current page: ${currentPage.name} (${currentPage.slug})` : 'No page selected'}
                                </Typography>
                                <button
                                    type="button"
                                    onClick={handleAiSubmit}
                                    disabled={!aiPrompt.trim() || isAiSubmitting || !currentPage}
                                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isAiSubmitting ? 'Applying...' : aiMode === 'generate' ? 'Generate Page' : 'Apply Edit'}
                                </button>
                            </div>
                            {aiResultJson ? (
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                                    <pre className="max-h-[40vh] overflow-auto p-4 text-xs leading-6 text-slate-100">
                                        <code>{aiResultJson}</code>
                                    </pre>
                                </div>
                            ) : null}
                        </div>
                    </Dialog>

                    <Dialog
                        open={isCodeDialogOpen}
                        title={generatedFileName || 'Generated React Component'}
                        onClose={() => setIsCodeDialogOpen(false)}
                        cancelText="Close"
                    >
                        <div className="w-[900px] max-w-full space-y-4 pt-1">
                            <div className="flex items-center justify-between gap-3">
                                <Typography variant="body2" className="text-sm text-slate-500">
                                    Generated from the current {generatedCodeSourceLabel} builder layout.
                                </Typography>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCopyGeneratedCode}
                                        disabled={!generatedCode}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadGeneratedCode}
                                        disabled={!generatedCode}
                                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                                <pre className="max-h-[70vh] overflow-auto p-4 text-xs leading-6 text-slate-100">
                                    <code>{generatedCode}</code>
                                </pre>
                            </div>
                        </div>
                    </Dialog>
                </DndContext>
            ) : (
                <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white text-slate-500">
                    Loading Builder...
                </div>
            )}
        </>
    );
};
