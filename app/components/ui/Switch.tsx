import React from 'react';
import { Switch as MuiSwitch, type SwitchProps, FormControlLabel } from '@mui/material';

export interface CustomSwitchProps extends SwitchProps {
    caption?: string;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
    fullWidth?: boolean;
}

export const Switch: React.FC<CustomSwitchProps> = ({
    caption,
    label,
    className,
    style,
    checked,
    onChange,
    fullWidth = true,
    ...props
}) => {
    const switchProps = onChange
        ? { checked, onChange }
        : { defaultChecked: Boolean(checked) };

    const wrapperStyle: React.CSSProperties = {
        minWidth: 0,
        ...(fullWidth ? { width: '100%' } : {}),
        ...(style || {})
    };

    return (
        <div className={className} style={wrapperStyle}>
            {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
            <FormControlLabel
                sx={{ width: fullWidth ? '100%' : undefined, minWidth: 0, display: 'flex', margin: 0 }}
                control={<MuiSwitch {...props} {...switchProps} />}
                label={label || ''}
            />
        </div>
    );
};
