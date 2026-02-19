
import React, { useState, useEffect } from 'react';
import { Tabs as MuiTabs, Tab, Box } from '@mui/material';
import { useBuilder } from '../context';

import { type ComponentNode } from '../types';
import { cn } from '../../lib/styleUtils';

interface TabsProps {
    node: ComponentNode;
    items?: { label: string; id: string }[];
    defaultValue?: number;
    className?: string;
    children?: React.ReactNode;
}

export const Tabs = ({ node, items = [], defaultValue = 0, className, children, ...props }: TabsProps) => {
    const { dispatch } = useBuilder();
    // Use local state for the active tab to allow immediate UI updates
    // We can also sync this to node props if we want persistence of the active tab selection
    const [value, setValue] = useState(defaultValue);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Ensure we have enough children containers for the tabs
    useEffect(() => {
        if (!node.children || node.children.length < items.length) {
            // We need to create children for tabs that don't have them
            // usages of effects to dispatch might cause loops if not careful
            // Ideally we should handle this at the "add component" time or "add tab" time
            // but here is a fallback or we can just render "Shared" content or "Empty"
        }
    }, [items.length, node.children?.length]);


    const handleInitTab = (index: number) => {
        const generateId = () => Math.random().toString(36).substr(2, 9);
        const newContainer: ComponentNode = {
            id: generateId(),
            type: 'Container',
            props: {
                className: 'p-4 border border-dashed border-gray-200 min-h-[100px]',
            },
            children: []
        };

        dispatch({
            type: 'ADD_NODE',
            payload: {
                parentId: node.id,
                node: newContainer,
                index: index
            }
        });
    };

    return (
        <Box className={cn("w-full", className)} {...props}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <MuiTabs value={value} onChange={handleChange} aria-label="tabs">
                    {items.map((item, index) => (
                        <Tab key={item.id || index} label={item.label} />
                    ))}
                </MuiTabs>
            </Box>
            {items.map((item, index) => (
                <div
                    key={item.id || index}
                    role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}
                    className="p-4"
                >
                    {value === index && (
                        <Box>
                            {/* 
                                Check if we have a child node at this index.
                                If yes, render it (it should be a Container ideally).
                                If no, show a button to initialize it.
                            */}
                            {node.children && node.children[index] ? (
                                // We rely on the Recursive rendering from the parent (Canvas) usually.
                                // But since `Tabs` is a specific component that controls *which* child to show,
                                // we might need to manually ensure the child is rendered.
                                // However, in our Builder, the `Container` component iterates over `node.children`.
                                // `Tabs` is a leaf in `registry`? No, it should be a container-like.
                                // But `registry` defines `component`.

                                // Actually, `Canvas` iterates and renders `NodeRenderer`. 
                                // `NodeRenderer` finds the component from registry and renders it, passing `node` and `children`.
                                // So `Tabs` receives `children` as a prop (which are the React elements of the children nodes).
                                // Let's check `Container.tsx` again.
                                // `Container` receives `children` prop.

                                // So here we should use the `children` prop passed to Tabs, which contains the rendered nodes.
                                // We just need to pick the right one.

                                // BUT `children` prop in `Container.tsx` seems to be just passing through if not using the internal logic.
                                // In `Canvas.tsx` (not visible but assumed), it maps `node.children` to `NodeRenderer`.
                                // So `children` prop passed to `Tabs` should be an array of React elements.

                                React.Children.toArray(children)[index] || (
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                                        <p className="text-sm text-gray-500 mb-4">No content for this tab yet</p>
                                        <button
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                            onClick={() => handleInitTab(index)}
                                        >
                                            Initialize Content
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-4">Tab is empty</p>
                                    <button
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                        onClick={() => handleInitTab(index)}
                                    >
                                        Initialize Content
                                    </button>
                                </div>
                            )}
                        </Box>
                    )}
                </div>
            ))}
        </Box>
    );
};
