import React from 'react';
import { useBuilder } from '../context';
import { Box } from '../../components/ui/Box';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type ComponentNode } from '../types';
import clsx from 'clsx';
import { cn } from '../../lib/styleUtils';

interface GroupProps {
    node: ComponentNode;
    children?: React.ReactNode;
    className?: string;
}

export const Group = ({ node, children, className, ...props }: GroupProps) => {
    const { dispatch } = useBuilder();

    const collapsed = Boolean(node.props?.collapsed);
    const title = node.props?.title || 'Group';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch?.({
            type: 'UPDATE_NODE',
            payload: {
                id: node.id,
                props: { collapsed: !collapsed }
            }
        });
    };

    return (
        <Box
            className={clsx('w-full transition-all', className)}
            {...props}
        >
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-700">{title}</div>
                <div>
                    <Button
                        variant="text"
                        onClick={(e) => toggle(e)}
                        className="!p-1"
                        aria-label={collapsed ? 'Expand group' : 'Collapse group'}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </Button>
                </div>
            </div>
            {!collapsed && (
                <div className={cn('p-3', node.props?.contentClassName || '')}>
                    {children}
                </div>
            )}
        </Box>
    );
};
