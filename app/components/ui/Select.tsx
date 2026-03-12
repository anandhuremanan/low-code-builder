import React from 'react';
import { Select as MuiSelect, type SelectProps, MenuItem, FormControl, InputLabel } from '@mui/material';

export interface Option {
    label: string;
    value: string | number;
}

export type CustomSelectProps = SelectProps & {
    caption?: string;
    label?: string;
    options: Option[];
    fullWidth?: boolean;
};

export const Select: React.FC<CustomSelectProps> = ({
    caption,
    label,
    options,
    fullWidth = true,
    className,
    style,
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
            <FormControl
                fullWidth={fullWidth}
                variant="outlined"
                sx={{
                    display: 'block',
                    width: fullWidth ? '100%' : undefined,
                    minWidth: 0
                }}
            >
            {label && <InputLabel>{label}</InputLabel>}
            <MuiSelect
                label={label}
                sx={{
                    width: fullWidth ? '100%' : undefined,
                    minWidth: 0
                }}
                {...props}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </MuiSelect>
            </FormControl>
        </div>
    );
};
