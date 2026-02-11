import React from 'react';
import { Button as MuiButton, type ButtonProps } from '@mui/material';

export interface CustomButtonProps extends ButtonProps {
    label?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(({ label, children, ...props }, ref) => {
    return (
        <MuiButton ref={ref} {...props}>
            {label || children}
        </MuiButton>
    );
});

Button.displayName = 'Button';
