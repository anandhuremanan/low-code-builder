
import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { type ComponentNode, type Page } from './types';

// Simple ID generator if we don't want to add another dependency
const generateId = () => Math.random().toString(36).substr(2, 9);

type HistoryState = {
    past: { pages: Page[]; currentPageId: string | null }[];
    future: { pages: Page[]; currentPageId: string | null }[];
};

type BuilderState = {
    pages: Page[];
    currentPageId: string | null;
    selectedNodeId: string | null;
    draggedComponentType: string | null; // For sidebar drag
    viewMode: 'desktop' | 'tablet' | 'mobile';
    history: HistoryState;
};

type Action =
    | { type: 'SET_VIEW_MODE'; payload: { mode: 'desktop' | 'tablet' | 'mobile' } }
    | { type: 'ADD_NODE'; payload: { parentId: string | null; node: ComponentNode } }
    | { type: 'UPDATE_NODE'; payload: { id: string; props: Record<string, any> } }
    | { type: 'DELETE_NODE'; payload: { id: string } }
    | { type: 'SELECT_NODE'; payload: { id: string | null } }
    | { type: 'SET_DRAGGED_COMPONENT'; payload: { type: string | null } }
    | { type: 'ADD_PAGE'; payload: { name: string } }
    | { type: 'SWITCH_PAGE'; payload: { id: string } }
    | { type: 'MOVE_NODE'; payload: { nodeId: string; newParentId: string | null; index: number } }
    | { type: 'UNDO' }
    | { type: 'REDO' };

const initialState: BuilderState = {
    pages: [
        {
            id: "home",
            name: "Home",
            slug: "/",
            nodes: [
                {
                    id: "root-container",
                    type: "Container",
                    props: { className: "min-h-screen p-8 bg-white" },
                    children: []
                }
            ]
        }
    ],
    currentPageId: "home",
    selectedNodeId: null,
    draggedComponentType: null,
    viewMode: 'desktop',
    history: {
        past: [],
        future: []
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

// Start: Helper to update node in tree (immutable)
const updateNodeInTree = (nodes: ComponentNode[], id: string, updater: (node: ComponentNode) => ComponentNode): ComponentNode[] => {
    return nodes.map((node) => {
        if (node.id === id) {
            return updater(node);
        }
        if (node.children.length > 0) {
            return { ...node, children: updateNodeInTree(node.children, id, updater) };
        }
        return node;
    });
};

const addNodeToParent = (nodes: ComponentNode[], parentId: string | null, newNode: ComponentNode): ComponentNode[] => {
    if (parentId === null) {
        return [...nodes, newNode];
    }
    return nodes.map((node) => {
        if (node.id === parentId) {
            return { ...node, children: [...node.children, newNode] };
        }
        if (node.children.length > 0) {
            return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
        }
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
        if (index >= 0 && index <= nextNodes.length) {
            nextNodes.splice(index, 0, nodeToInsert);
        } else {
            nextNodes.push(nodeToInsert);
        }
        return nextNodes;
    }

    return nodes.map((node) => {
        if (node.id === parentId) {
            const nextChildren = [...node.children];
            if (index >= 0 && index <= nextChildren.length) {
                nextChildren.splice(index, 0, nodeToInsert);
            } else {
                nextChildren.push(nodeToInsert);
            }
            return { ...node, children: nextChildren };
        }
        if (node.children.length > 0) {
            return { ...node, children: insertNodeToParent(node.children, parentId, nodeToInsert, index) };
        }
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
    return nodes.filter(node => node.id !== nodeId).map(node => ({
        ...node,
        children: removeNodeFromTree(node.children, nodeId)
    }));
};
// End: Helper

const pushToHistory = (state: BuilderState): HistoryState => {
    const { pages, currentPageId } = state;
    const newPast = [
        ...state.history.past,
        { pages, currentPageId }
    ];
    // Optional: Limit history size
    if (newPast.length > 50) newPast.shift();

    return {
        past: newPast,
        future: []
    };
};

const builderReducer = (state: BuilderState, action: Action): BuilderState => {
    const currentPage = state.pages.find(p => p.id === state.currentPageId)!;
    const otherPages = state.pages.filter(p => p.id !== state.currentPageId);

    switch (action.type) {
        case 'UNDO': {
            if (state.history.past.length === 0) return state;
            const previous = state.history.past[state.history.past.length - 1];
            const newPast = state.history.past.slice(0, -1);

            return {
                ...state,
                pages: previous.pages,
                currentPageId: previous.currentPageId,
                history: {
                    past: newPast,
                    future: [{ pages: state.pages, currentPageId: state.currentPageId }, ...state.history.future]
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
                history: {
                    past: [...state.history.past, { pages: state.pages, currentPageId: state.currentPageId }],
                    future: newFuture
                }
            };
        }

        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload.mode };

        case 'SELECT_NODE':
            return { ...state, selectedNodeId: action.payload.id };

        case 'SET_DRAGGED_COMPONENT':
            return { ...state, draggedComponentType: action.payload.type };

        case 'ADD_NODE': {
            const { parentId, node } = action.payload;
            const updatedNodes = addNodeToParent(currentPage.nodes, parentId, node);
            return {
                ...state,
                history: pushToHistory(state),
                pages: [...otherPages, { ...currentPage, nodes: updatedNodes }]
            };
        }

        case 'UPDATE_NODE': {
            const { id, props } = action.payload;
            const updatedNodes = updateNodeInTree(currentPage.nodes, id, (node) => ({ ...node, props: { ...node.props, ...props } }));
            return {
                ...state,
                history: pushToHistory(state),
                pages: [...otherPages, { ...currentPage, nodes: updatedNodes }]
            };
        }

        case 'MOVE_NODE': {
            const { nodeId, newParentId, index } = action.payload;

            // Do not allow dragging the root section
            if (nodeId === 'root-container') return state;
            if (nodeId === newParentId) return state;

            const nodeToMove = findNode(currentPage.nodes, nodeId);
            if (!nodeToMove) return state;

            // Prevent moving a node into its own descendant
            if (newParentId && findNode(nodeToMove.children, newParentId)) {
                return state;
            }

            const extracted = extractNodeFromTree(currentPage.nodes, nodeId);
            if (!extracted.extracted) return state;

            const updatedNodes = insertNodeToParent(
                extracted.nodes,
                newParentId,
                extracted.extracted,
                index
            );

            return {
                ...state,
                history: pushToHistory(state),
                pages: [...otherPages, { ...currentPage, nodes: updatedNodes }]
            };
        }

        case 'DELETE_NODE': {
            const { id } = action.payload;
            // Cannot delete root
            if (id === 'root-container') return state;
            const updatedNodes = removeNodeFromTree(currentPage.nodes, id);
            return {
                ...state,
                selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
                history: pushToHistory(state),
                pages: [...otherPages, { ...currentPage, nodes: updatedNodes }]
            };
        }

        case 'SWITCH_PAGE': {
            return { ...state, currentPageId: action.payload.id, selectedNodeId: null };
        }

        case 'ADD_PAGE': {
            const newPage: Page = {
                id: generateId(),
                name: action.payload.name,
                slug: `/${action.payload.name.toLowerCase().replace(/\s+/g, '-')}`,
                nodes: [{
                    id: generateId(),
                    type: 'Container',
                    props: { className: "min-h-screen p-8 bg-white" },
                    children: []
                }]
            };
            return {
                ...state,
                history: pushToHistory(state),
                pages: [...state.pages, newPage],
                currentPageId: newPage.id
            };
        }

        default:
            return state;
    }
};

const BuilderContext = createContext<{
    state: BuilderState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);

    return (
        <BuilderContext.Provider value={{ state, dispatch }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) {
        throw new Error('useBuilder must be used within a BuilderProvider');
    }
    return context;
};
