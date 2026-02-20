import React from 'react';
import { Switch as MuiSwitch, type SwitchProps, FormControlLabel } from '@mui/material';

export interface CustomSwitchProps extends SwitchProps {
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const Switch: React.FC<CustomSwitchProps> = ({ label, className, style, checked, onChange, ...props }) => {
    const switchProps = onChange
        ? { checked, onChange }
        : { defaultChecked: Boolean(checked) };

    return (
        <FormControlLabel
            className={className}
            style={style}
            control={<MuiSwitch {...props} {...switchProps} />}
            label={label || ''}
        />
    );
};
