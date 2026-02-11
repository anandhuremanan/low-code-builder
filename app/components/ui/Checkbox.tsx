import React from 'react';
import { Checkbox as MuiCheckbox, type CheckboxProps, FormControlLabel } from '@mui/material';

export interface CustomCheckboxProps extends CheckboxProps {
    label?: string;
}

export const Checkbox: React.FC<CustomCheckboxProps> = ({ label, ...props }) => {
    return (
        <FormControlLabel
            control={<MuiCheckbox {...props} />}
            label={label || ''}
        />
    );
};
