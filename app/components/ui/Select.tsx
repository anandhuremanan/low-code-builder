import React from 'react';
import { Select as MuiSelect, type SelectProps, MenuItem, FormControl, InputLabel } from '@mui/material';

export interface Option {
    label: string;
    value: string | number;
}

export type CustomSelectProps = SelectProps & {
    label?: string;
    options: Option[];
    fullWidth?: boolean;
};

export const Select: React.FC<CustomSelectProps> = ({ label, options, fullWidth = false, ...props }) => {
    return (
        <FormControl fullWidth={fullWidth} variant="outlined">
            {label && <InputLabel>{label}</InputLabel>}
            <MuiSelect label={label} {...props}>
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </MuiSelect>
        </FormControl>
    );
};
