import React from 'react';
import { Checkbox as MuiCheckbox, type CheckboxProps, FormControlLabel } from '@mui/material';

export interface CustomCheckboxProps extends CheckboxProps {
    caption?: string;
    label?: string;
    fullWidth?: boolean;
    node?: unknown;
}

export const Checkbox: React.FC<CustomCheckboxProps> = ({
    caption,
    label,
    fullWidth = true,
    className,
    style,
    checked,
    onChange,
    node: _unusedNode,
    ...props
}) => {
    const wrapperStyle: React.CSSProperties = {
        minWidth: 0,
        ...(fullWidth ? { width: '100%' } : {}),
        ...(style || {})
    };

    return (
        <div className={className} style={wrapperStyle}>
            {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
            <FormControlLabel
                sx={{
                    width: fullWidth ? '100%' : undefined,
                    minWidth: 0,
                    display: 'flex',
                    margin: 0
                }}
                control={<MuiCheckbox {...props} checked={checked} onChange={onChange} />}
                label={label || ''}
            />
        </div>
    );
};
