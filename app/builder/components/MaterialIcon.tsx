import React from 'react';
import { Icon } from '@mui/material';
import { cn } from '../../lib/utils';

interface MaterialIconProps {
    icon?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
    icon = 'home',
    className,
    style
}) => {
    return (
        <Icon
            className={cn("material-icons", className)}
            style={{ ...style, fontSize: style?.fontSize, color: style?.color }}
        >
            {icon}
        </Icon>
    );
};
