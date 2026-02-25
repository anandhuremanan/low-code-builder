import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { type ComponentNode, type CustomStyle, type Page, type SiteSectionKey, type SiteSections } from './types';

const BUILDER_STATE_STORAGE_KEY = 'builder-editor-state-v1';
const generateId = () => Math.random().toString(36).substr(2, 9);

const createRootContainerNode = (className: string): ComponentNode => ({
    id: 'root-container',
    type: 'Container',
    props: { className },
    children: []
});

const createDefaultSiteSections = (): SiteSections => ({
    header: {
        enabled: false,
        nodes: [createRootContainerNode('w-full p-4 bg-white')]
    },
    footer: {
        enabled: false,
        nodes: [createRootContainerNode('w-full p-4 bg-white')]
    }
});

type HistorySnapshot = {
    pages: Page[];
    currentPageId: string | null;
    siteSections: SiteSections;
    editingTarget: 'page' | SiteSectionKey;
};

type HistoryState = {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
};

type BuilderState = {
    pages: Page[];
    currentPageId: string | null;
    siteSections: SiteSections;
    editingTarget: 'page' | SiteSectionKey;
    selectedNodeId: string | null;
    draggedComponentType: string | null;
    viewMode: 'desktop' | 'tablet' | 'mobile';
    customStyles: CustomStyle[];
    history: HistoryState;
};

type Action =
    | { type: 'SET_VIEW_MODE'; payload: { mode: 'desktop' | 'tablet' | 'mobile' } }
    | { type: 'SET_EDITING_TARGET'; payload: { target: 'page' | SiteSectionKey } }
    | { type: 'TOGGLE_SITE_SECTION'; payload: { section: SiteSectionKey; enabled: boolean } }
    | { type: 'ADD_NODE'; payload: { parentId: string | null; node: ComponentNode; index?: number } }
    | { type: 'UPDATE_NODE'; payload: { id: string; props: Record<string, any> } }
    | { type: 'DELETE_NODE'; payload: { id: string } }
    | { type: 'SELECT_NODE'; payload: { id: string | null } }
    | { type: 'SET_DRAGGED_COMPONENT'; payload: { type: string | null } }
    | { type: 'ADD_PAGE'; payload: { name: string } }
    | { type: 'SWITCH_PAGE'; payload: { id: string } }
    | { type: 'MOVE_NODE'; payload: { nodeId: string; newParentId: string | null; index: number } }
    | { type: 'ADD_CUSTOM_STYLE'; payload: { style: CustomStyle } }
    | { type: 'REMOVE_CUSTOM_STYLE'; payload: { id: string } }
    | { type: 'UNDO' }
    | { type: 'REDO' };

const initialState: BuilderState = {
    pages: [
        {
            id: 'home',
            name: 'Home',
            slug: '/',
            nodes: [createRootContainerNode('min-h-screen p-8 bg-white')]
        }
    ],
    currentPageId: 'home',
    siteSections: createDefaultSiteSections(),
    editingTarget: 'page',
    selectedNodeId: null,
    draggedComponentType: null,
    viewMode: 'desktop',
    customStyles: [],
    history: {
        past: [],
        future: []
    }
};

const hydrateState = (): BuilderState => {
    if (typeof window === 'undefined') return initialState;
    const raw = window.localStorage.getItem(BUILDER_STATE_STORAGE_KEY);
    if (!raw) return initialState;

    try {
        const parsed = JSON.parse(raw) as Partial<BuilderState>;
        const pages = Array.isArray(parsed.pages) && parsed.pages.length > 0 ? parsed.pages : initialState.pages;
        const currentPageId = typeof parsed.currentPageId === 'string' ? parsed.currentPageId : pages[0]?.id || null;
        const editingTarget = parsed.editingTarget === 'header' || parsed.editingTarget === 'footer' ? parsed.editingTarget : 'page';

        return {
            ...initialState,
            ...parsed,
            pages,
            currentPageId,
            siteSections: {
                ...createDefaultSiteSections(),
                ...(parsed.siteSections || {})
            },
            editingTarget,
            history: {
                past: [],
                future: []
            }
        };
    } catch {
        return initialState;
    }
};

const findNode = (nodes: ComponentNode[], id: string): ComponentNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
    }
    return null;
};

const updateNodeInTree = (nodes: ComponentNode[], id: string, updater: (node: ComponentNode) => ComponentNode): ComponentNode[] => {
    return nodes.map((node) => {
        if (node.id === id) return updater(node);
        if (node.children.length > 0) return { ...node, children: updateNodeInTree(node.children, id, updater) };
        return node;
    });
};

const addNodeToParent = (nodes: ComponentNode[], parentId: string | null, newNode: ComponentNode): ComponentNode[] => {
    if (parentId === null) return [...nodes, newNode];
    return nodes.map((node) => {
        if (node.id === parentId) return { ...node, children: [...node.children, newNode] };
        if (node.children.length > 0) return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
        return node;
    });
};

const insertNodeToParent = (
    nodes: ComponentNode[],
    parentId: string | null,
    nodeToInsert: ComponentNode,
    index: number = -1
): ComponentNode[] => {
    if (parentId === null) {
        const nextNodes = [...nodes];
        if (index >= 0 && index <= nextNodes.length) nextNodes.splice(index, 0, nodeToInsert);
        else nextNodes.push(nodeToInsert);
        return nextNodes;
    }

    return nodes.map((node) => {
        if (node.id === parentId) {
            const nextChildren = [...node.children];
            if (index >= 0 && index <= nextChildren.length) nextChildren.splice(index, 0, nodeToInsert);
            else nextChildren.push(nodeToInsert);
            return { ...node, children: nextChildren };
        }
        if (node.children.length > 0) return { ...node, children: insertNodeToParent(node.children, parentId, nodeToInsert, index) };
        return node;
    });
};

const extractNodeFromTree = (
    nodes: ComponentNode[],
    nodeId: string
): { nodes: ComponentNode[]; extracted: ComponentNode | null } => {
    let extracted: ComponentNode | null = null;
    const nextNodes: ComponentNode[] = [];

    for (const node of nodes) {
        if (node.id === nodeId) {
            extracted = node;
            continue;
        }

        if (node.children.length > 0) {
            const result = extractNodeFromTree(node.children, nodeId);
            if (result.extracted) extracted = result.extracted;
            nextNodes.push({ ...node, children: result.nodes });
            continue;
        }

        nextNodes.push(node);
    }

    return { nodes: nextNodes, extracted };
};

const removeNodeFromTree = (nodes: ComponentNode[], nodeId: string): ComponentNode[] => {
    return nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => ({ ...node, children: removeNodeFromTree(node.children, nodeId) }));
};

const getActiveNodes = (state: BuilderState): ComponentNode[] => {
    if (state.editingTarget === 'page') {
        const currentPage = state.pages.find((p) => p.id === state.currentPageId);
        return currentPage?.nodes || [];
    }
    return state.siteSections[state.editingTarget].nodes;
};

const withUpdatedActiveNodes = (state: BuilderState, nodes: ComponentNode[]): BuilderState => {
    if (state.editingTarget === 'page') {
        const currentPage = state.pages.find((p) => p.id === state.currentPageId);
        if (!currentPage) return state;
        return {
            ...state,
            pages: state.pages.map((page) => (page.id === currentPage.id ? { ...page, nodes } : page))
        };
    }

    return {
        ...state,
        siteSections: {
            ...state.siteSections,
            [state.editingTarget]: {
                ...state.siteSections[state.editingTarget],
                nodes
            }
        }
    };
};

const pushToHistory = (state: BuilderState): HistoryState => {
    const snapshot: HistorySnapshot = {
        pages: state.pages,
        currentPageId: state.currentPageId,
        siteSections: state.siteSections,
        editingTarget: state.editingTarget
    };
    const newPast = [...state.history.past, snapshot];
    if (newPast.length > 50) newPast.shift();
    return { past: newPast, future: [] };
};

const builderReducer = (state: BuilderState, action: Action): BuilderState => {
    const activeNodes = getActiveNodes(state);

    switch (action.type) {
        case 'UNDO': {
            if (state.history.past.length === 0) return state;
            const previous = state.history.past[state.history.past.length - 1];
            const newPast = state.history.past.slice(0, -1);

            return {
                ...state,
                pages: previous.pages,
                currentPageId: previous.currentPageId,
                siteSections: previous.siteSections,
                editingTarget: previous.editingTarget,
                selectedNodeId: null,
                history: {
                    past: newPast,
                    future: [{
                        pages: state.pages,
                        currentPageId: state.currentPageId,
                        siteSections: state.siteSections,
                        editingTarget: state.editingTarget
                    }, ...state.history.future]
                }
            };
        }

        case 'REDO': {
            if (state.history.future.length === 0) return state;
            const next = state.history.future[0];
            const newFuture = state.history.future.slice(1);

            return {
                ...state,
                pages: next.pages,
                currentPageId: next.currentPageId,
                siteSections: next.siteSections,
                editingTarget: next.editingTarget,
                selectedNodeId: null,
                history: {
                    past: [...state.history.past, {
                        pages: state.pages,
                        currentPageId: state.currentPageId,
                        siteSections: state.siteSections,
                        editingTarget: state.editingTarget
                    }],
                    future: newFuture
                }
            };
        }

        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload.mode };

        case 'SET_EDITING_TARGET':
            return { ...state, editingTarget: action.payload.target, selectedNodeId: null };

        case 'TOGGLE_SITE_SECTION': {
            const { section, enabled } = action.payload;
            return {
                ...state,
                siteSections: {
                    ...state.siteSections,
                    [section]: {
                        ...state.siteSections[section],
                        enabled
                    }
                }
            };
        }

        case 'SELECT_NODE':
            return { ...state, selectedNodeId: action.payload.id };

        case 'SET_DRAGGED_COMPONENT':
            return { ...state, draggedComponentType: action.payload.type };

        case 'ADD_NODE': {
            const { parentId, node, index } = action.payload;
            const updatedNodes = typeof index === 'number'
                ? insertNodeToParent(activeNodes, parentId, node, index)
                : addNodeToParent(activeNodes, parentId, node);

            return withUpdatedActiveNodes({
                ...state,
                history: pushToHistory(state)
            }, updatedNodes);
        }

        case 'UPDATE_NODE': {
            const { id, props } = action.payload;
            const updatedNodes = updateNodeInTree(activeNodes, id, (node) => ({ ...node, props: { ...node.props, ...props } }));

            return withUpdatedActiveNodes({
                ...state,
                history: pushToHistory(state)
            }, updatedNodes);
        }

        case 'MOVE_NODE': {
            const { nodeId, newParentId, index } = action.payload;
            if (nodeId === 'root-container' || nodeId === newParentId) return state;

            const nodeToMove = findNode(activeNodes, nodeId);
            if (!nodeToMove) return state;
            if (newParentId && findNode(nodeToMove.children, newParentId)) return state;

            const extracted = extractNodeFromTree(activeNodes, nodeId);
            if (!extracted.extracted) return state;

            const updatedNodes = insertNodeToParent(extracted.nodes, newParentId, extracted.extracted, index);

            return withUpdatedActiveNodes({
                ...state,
                history: pushToHistory(state)
            }, updatedNodes);
        }

        case 'DELETE_NODE': {
            const { id } = action.payload;
            if (id === 'root-container') return state;
            const updatedNodes = removeNodeFromTree(activeNodes, id);

            return withUpdatedActiveNodes({
                ...state,
                selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
                history: pushToHistory(state)
            }, updatedNodes);
        }

        case 'SWITCH_PAGE':
            return { ...state, currentPageId: action.payload.id, editingTarget: 'page', selectedNodeId: null };

        case 'ADD_PAGE': {
            const newPage: Page = {
                id: generateId(),
                name: action.payload.name,
                slug: `/${action.payload.name.toLowerCase().replace(/\s+/g, '-')}`,
                nodes: [createRootContainerNode('min-h-screen p-8 bg-white')]
            };

            return {
                ...state,
                history: pushToHistory(state),
                pages: [...state.pages, newPage],
                currentPageId: newPage.id,
                editingTarget: 'page',
                selectedNodeId: null
            };
        }

        case 'ADD_CUSTOM_STYLE':
            return { ...state, customStyles: [...state.customStyles, action.payload.style] };

        case 'REMOVE_CUSTOM_STYLE':
            return { ...state, customStyles: state.customStyles.filter((style) => style.id !== action.payload.id) };

        default:
            return state;
    }
};

const BuilderContext = createContext<{
    state: BuilderState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState, hydrateState);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(BUILDER_STATE_STORAGE_KEY, JSON.stringify({
            pages: state.pages,
            currentPageId: state.currentPageId,
            siteSections: state.siteSections,
            editingTarget: state.editingTarget,
            selectedNodeId: state.selectedNodeId,
            draggedComponentType: state.draggedComponentType,
            viewMode: state.viewMode,
            customStyles: state.customStyles
        }));
    }, [state]);

    return (
        <BuilderContext.Provider value={{ state, dispatch }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder must be used within a BuilderProvider');
    return context;
};
