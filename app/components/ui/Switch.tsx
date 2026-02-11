import React from 'react';
import { Switch as MuiSwitch, type SwitchProps, FormControlLabel } from '@mui/material';

export interface CustomSwitchProps extends SwitchProps {
    label?: string;
}

export const Switch: React.FC<CustomSwitchProps> = ({ label, ...props }) => {
    return (
        <FormControlLabel
            control={<MuiSwitch {...props} />}
            label={label || ''}
        />
    );
};
