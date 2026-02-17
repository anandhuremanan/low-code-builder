import React from 'react';
import { Button as MuiButton, type ButtonProps, Icon } from '@mui/material';

export interface CustomButtonProps extends ButtonProps {
    label?: string;
    icon?: string;
    iconPos?: 'start' | 'end';
}

export const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(({ label, children, icon, iconPos = 'start', ...props }, ref) => {
    const iconElement = icon ? <Icon>{icon}</Icon> : undefined;

    return (
        <MuiButton
            ref={ref}
            {...props}
            startIcon={iconPos === 'start' ? iconElement : undefined}
            endIcon={iconPos === 'end' ? iconElement : undefined}
        >
            {label || children}
        </MuiButton>
    );
});

Button.displayName = 'Button';
