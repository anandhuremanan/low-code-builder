import React from 'react';
import { Select as MuiSelect, type SelectProps, MenuItem, FormControl, InputLabel, Chip, Box, OutlinedInput } from '@mui/material';

export interface Option {
    label: string;
    value: string | number;
}

export type CustomMultiSelectProps = Omit<SelectProps, 'value' | 'onChange'> & {
    label?: string;
    options: Option[];
    fullWidth?: boolean;
    value?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
};

export const MultiSelect: React.FC<CustomMultiSelectProps> = ({
    label,
    options,
    fullWidth = false,
    value = [],
    onChange,
    ...props
}) => {
    const handleChange = (event: any) => {
        const {
            target: { value },
        } = event;
        // On autofill we get a stringified value.
        const newValue = typeof value === 'string' ? value.split(',') : value;
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <FormControl fullWidth={fullWidth}>
            {label && <InputLabel>{label}</InputLabel>}
            <MuiSelect
                label={label}
                multiple
                value={value}
                onChange={handleChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as (string | number)[]).map((selectedValue) => {
                            const option = options.find(o => o.value === selectedValue);
                            return (
                                <Chip key={selectedValue} label={option?.label || selectedValue} />
                            );
                        })}
                    </Box>
                )}
                {...props}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </MuiSelect>
        </FormControl>
    );
};
