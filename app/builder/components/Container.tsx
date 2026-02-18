
import React from 'react';
import { useBuilder } from '../context';
import { Box } from '../../components/ui/Box';
import { Button } from '../../components/ui/Button';
import { Columns, Layout, Square } from 'lucide-react';
import { type ComponentNode } from '../types';
import clsx from 'clsx';
import { cn } from '../../lib/styleUtils';

// We need a way to render children recursively, avoiding circular dependency
// In a real app we might use a context or pass the renderer as a prop.
// For now, let's assume the parent Canvas handles the recursion or we just render children here if passed.
// Actually, the Canvas NodeRenderer handles the recursion.
// But we need to render the children inside this component.

interface ContainerProps {
    node: ComponentNode;
    children?: React.ReactNode;
    className?: string; // allow overrides
}

export const Container = ({ node, children, className, ...props }: ContainerProps) => {
    const { dispatch } = useBuilder();

    const isColumn = Boolean(node.props.isColumn);
    const isEmpty = !node.children || node.children.length === 0;
    const shouldShowStructureSelector = isEmpty && !isColumn;

    const handleSelectLayout = (layout: '1-col' | '2-col-50' | '2-col-30-70' | '3-col') => {
        const generateId = () => Math.random().toString(36).substr(2, 9);

        let newChildren: any[] = [];

        const createColumn = (widthClass: string) => ({
            id: generateId(),
            type: 'Container',
            props: {
                className: `min-h-[50px] border border-dashed border-gray-200 ${widthClass}`,
                isColumn: true
            },
            children: []
        });

        const rowClass = layout === '1-col'
            ? 'w-full flex flex-col'
            : 'w-full flex flex-row flex-wrap';

        switch (layout) {
            case '1-col':
                // Elementor-style single column should occupy full row width.
                newChildren = [createColumn('w-full basis-full')];
                break;
            case '2-col-50':
                newChildren = [createColumn('w-1/2 basis-1/2'), createColumn('w-1/2 basis-1/2')];
                break;
            case '2-col-30-70':
                newChildren = [createColumn('w-[30%] basis-[30%]'), createColumn('w-[70%] basis-[70%]')];
                break;
            case '3-col':
                newChildren = [createColumn('w-1/3 basis-1/3'), createColumn('w-1/3 basis-1/3'), createColumn('w-1/3 basis-1/3')];
                break;
        }

        newChildren.forEach(child => {
            dispatch({
                type: 'ADD_NODE',
                payload: {
                    parentId: node.id,
                    node: child
                }
            });
        });

        // Also we might want to update this container to be a flex container
        dispatch({
            type: 'UPDATE_NODE',
            payload: {
                id: node.id,
                props: {
                    className: cn(node.props.className || '', rowClass)
                }
            }
        });
    };

    return (
        <Box
            className={clsx(
                "relative transition-all",
                className
            )}
            {...props}
        >
            {shouldShowStructureSelector ? (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded border-2 border-dashed border-gray-300">
                    <p className="text-sm font-medium text-gray-500 mb-4">Select Structure</p>
                    <div className="flex gap-2">
                        <Button
                            variant="text"
                            onClick={(e) => { e.stopPropagation(); handleSelectLayout('1-col'); }}
                            className="flex flex-col items-center gap-1 h-auto p-2 hover:bg-gray-100"
                        >
                            <Square size={24} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500">1 Col</span>
                        </Button>
                        <Button
                            variant="text"
                            onClick={(e) => { e.stopPropagation(); handleSelectLayout('2-col-50'); }}
                            className="flex flex-col items-center gap-1 h-auto p-2 hover:bg-gray-100"
                        >
                            <Columns size={24} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500">2 Col</span>
                        </Button>
                        <Button
                            variant="text"
                            onClick={(e) => { e.stopPropagation(); handleSelectLayout('2-col-30-70'); }}
                            className="flex flex-col items-center gap-1 h-auto p-2 hover:bg-gray-100"
                        >
                            <Columns size={24} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500">30/70</span>
                        </Button>
                        <Button
                            variant="text"
                            onClick={(e) => { e.stopPropagation(); handleSelectLayout('3-col'); }}
                            className="flex flex-col items-center gap-1 h-auto p-2 hover:bg-gray-100"
                        >
                            <Layout size={24} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500">3 Col</span>
                        </Button>
                    </div>
                </div>
            ) : isEmpty && isColumn ? (
                <div className="h-full min-h-[80px] flex items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400">
                    Drop widgets here
                </div>
            ) : (
                children
            )}
        </Box>
    );
};
