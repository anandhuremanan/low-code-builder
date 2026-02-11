
import React, { useEffect, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useBuilder } from '../context';
import { COMPONENT_REGISTRY } from '../registry';
import { type ComponentNode } from '../types';
import clsx from 'clsx';

// Helper for class merging if not exists, I will use clsx + tailwind-merge locally if needed
// For now I will assume I can use clsx directly or create a util.
const extractMarginClasses = (className?: string): string => {
    if (!className) return '';
    return className
        .split(/\s+/)
        .filter((token) => /^m([trblxy])?-/.test(token))
        .join(' ');
};

const extractLayoutClasses = (className?: string): string => {
    if (!className) return '';
    return className
        .split(/\s+/)
        .filter((token) => /^w-/.test(token) || /^h-/.test(token) || /^basis-/.test(token) || /^flex-/.test(token) || token === 'grow' || token === 'shrink' || token === 'self-start' || token === 'self-center' || token === 'self-end' || token === 'self-stretch')
        .join(' ');
};

type ResizeHandle = 'right' | 'bottom' | 'corner';

const pxFromStyleOrFallback = (value: unknown, fallback: number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const match = value.trim().match(/^(-?\d+(\.\d+)?)px$/);
        if (match) return Number(match[1]);
    }
    return fallback;
};

const NodeRenderer = ({ node }: { node: ComponentNode }) => {
    const { state, dispatch } = useBuilder();
    const componentEntry = COMPONENT_REGISTRY[node.type];

    // Setup droppable for container types
    const isContainer = node.type === 'Container';
    const { setNodeRef, isOver } = useDroppable({
        id: node.id,
        data: {
            isContainer: true,
            acceptsChildren: true
        },
        disabled: !isContainer
    });
    const isRoot = node.id === 'root-container';
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStateRef = useRef<{
        handle: ResizeHandle;
        startX: number;
        startY: number;
        initialWidth: number;
        initialHeight: number;
        initialStyle: Record<string, any>;
        nodeId: string;
    } | null>(null);
    const {
        attributes,
        listeners,
        setNodeRef: setDraggableNodeRef,
        isDragging
    } = useDraggable({
        id: `drag-${node.id}`,
        data: {
            isNew: false,
            nodeId: node.id,
            type: node.type
        },
        disabled: isRoot || isResizing
    });

    if (!componentEntry) return null;

    const Component = componentEntry.component;

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_NODE', payload: { id: node.id } });
    };

    const isSelected = state.selectedNodeId === node.id;
    const hasChildNodes = node.children.length > 0;
    const hasOwnChildrenProp = Object.prototype.hasOwnProperty.call(node.props, 'children');
    const componentProps: Record<string, any> = {
        ...componentEntry.defaultProps,
        ...node.props,
        node
    };
    const wrapperMarginClasses = extractMarginClasses(node.props.className);
    const wrapperLayoutClasses = extractLayoutClasses(node.props.className);
    const wrapperSizeStyle = {
        width: node.props?.style?.width,
        height: node.props?.style?.height,
    } as React.CSSProperties;

    const stopResizeTracking = () => {
        setIsResizing(false);
        resizeStateRef.current = null;
        window.removeEventListener('mousemove', onResizeMove);
        window.removeEventListener('mouseup', stopResizeTracking);
    };

    const onResizeMove = (event: MouseEvent) => {
        const stateRef = resizeStateRef.current;
        if (!stateRef) return;

        const deltaX = event.clientX - stateRef.startX;
        const deltaY = event.clientY - stateRef.startY;
        const minSize = 20;

        let nextWidth = stateRef.initialWidth;
        let nextHeight = stateRef.initialHeight;

        if (stateRef.handle === 'right' || stateRef.handle === 'corner') {
            nextWidth = Math.max(minSize, Math.round(stateRef.initialWidth + deltaX));
        }
        if (stateRef.handle === 'bottom' || stateRef.handle === 'corner') {
            nextHeight = Math.max(minSize, Math.round(stateRef.initialHeight + deltaY));
        }

        const nextStyle: Record<string, any> = { ...stateRef.initialStyle };
        if (stateRef.handle === 'right' || stateRef.handle === 'corner') {
            nextStyle.width = `${nextWidth}px`;
        }
        if (stateRef.handle === 'bottom' || stateRef.handle === 'corner') {
            nextStyle.height = `${nextHeight}px`;
        }

        dispatch({
            type: 'UPDATE_NODE',
            payload: { id: stateRef.nodeId, props: { style: nextStyle } }
        });
    };

    const startResize = (handle: ResizeHandle, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        const currentStyle = { ...(node.props.style || {}) };
        resizeStateRef.current = {
            handle,
            startX: event.clientX,
            startY: event.clientY,
            initialWidth: pxFromStyleOrFallback(currentStyle.width, rect.width),
            initialHeight: pxFromStyleOrFallback(currentStyle.height, rect.height),
            initialStyle: currentStyle,
            nodeId: node.id
        };

        setIsResizing(true);
        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', stopResizeTracking);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', onResizeMove);
            window.removeEventListener('mouseup', stopResizeTracking);
        };
    }, []);

    if (hasChildNodes) {
        componentProps.children = node.children.map(child => <NodeRenderer key={child.id} node={child} />);
    } else if (hasOwnChildrenProp) {
        componentProps.children = node.props.children;
    }

    return (
        <div
            ref={(element) => {
                wrapperRef.current = element;
                if (isContainer) setNodeRef(element);
                setDraggableNodeRef(element);
            }}
            onClick={handleSelect}
            {...attributes}
            {...listeners}
            style={wrapperSizeStyle}
            className={clsx(
                "relative transition-all duration-200 outline-none",
                isRoot ? "w-full" : "",
                !isContainer ? "inline-block align-top" : "",
                wrapperMarginClasses,
                wrapperLayoutClasses,
                isSelected ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300",
                isContainer && isOver ? "bg-blue-50/50 ring-2 ring-blue-400" : "",
                isDragging ? "opacity-50" : ""
            )}
        >
            <Component {...componentProps} />

            {isSelected && !isRoot && (
                <>
                    <div
                        onMouseDown={(e) => startResize('right', e)}
                        className="absolute top-1/2 -right-1.5 h-6 w-3 -translate-y-1/2 cursor-ew-resize rounded bg-blue-500/80 hover:bg-blue-500"
                    />
                    <div
                        onMouseDown={(e) => startResize('bottom', e)}
                        className="absolute -bottom-1.5 left-1/2 h-3 w-6 -translate-x-1/2 cursor-ns-resize rounded bg-blue-500/80 hover:bg-blue-500"
                    />
                    <div
                        onMouseDown={(e) => startResize('corner', e)}
                        className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded bg-blue-600 hover:bg-blue-500"
                    />
                </>
            )}

            {/* Label for selected component */}
            {isSelected && (
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t z-10">
                    {componentEntry.name}
                </div>
            )}
        </div>
    );
};

export const Canvas = () => {
    const { state } = useBuilder();
    const currentPage = state.pages.find(p => p.id === state.currentPageId);

    // Root droppable area
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-root',
        data: {
            isContainer: true,
            root: true
        }
    });

    if (!currentPage) return <div>No page selected</div>;

    const widthClass = {
        desktop: 'w-full max-w-6xl',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    }[state.viewMode] || 'w-full max-w-6xl';

    return (
        <div className="flex-1 h-full bg-gray-100 p-8 overflow-auto flex justify-center transition-all">
            <div
                ref={setNodeRef}
                className={clsx(
                    widthClass,
                    "min-h-[80vh] bg-white shadow-sm transition-all duration-300 ease-in-out",
                    isOver ? "bg-blue-50 ring-2 ring-blue-400" : ""
                )}
            >
                {currentPage.nodes.map(node => (
                    <NodeRenderer key={node.id} node={node} />
                ))}

                {currentPage.nodes.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10">
                        <p>Drop components here</p>
                    </div>
                )}
            </div>
        </div>
    );
};
