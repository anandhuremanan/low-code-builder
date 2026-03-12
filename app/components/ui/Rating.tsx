import React from 'react';
import { FormControl, FormLabel, Rating as MuiRating } from '@mui/material';

export type CustomRatingProps = {
    className?: string;
    style?: React.CSSProperties;
    caption?: string;
    fullWidth?: boolean;
    label?: string;
    value?: number | null;
    max?: number;
    precision?: number;
    readOnly?: boolean;
    size?: 'small' | 'medium' | 'large';
    onChange?: (value: number | null) => void;
};

export const Rating: React.FC<CustomRatingProps> = ({
    className,
    style,
    caption,
    fullWidth = true,
    label,
    value = 0,
    max = 5,
    precision = 1,
    readOnly = false,
    size = 'medium',
    onChange
}) => {
    const wrapperStyle: React.CSSProperties = {
        minWidth: 0,
        ...(fullWidth ? { width: '100%' } : {}),
        ...(style || {})
    };

    return (
        <div className={className} style={wrapperStyle}>
            {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
            <FormControl sx={{ width: fullWidth ? '100%' : undefined, minWidth: 0 }}>
                {label && <FormLabel>{label}</FormLabel>}
                <MuiRating
                    value={value}
                    max={max}
                    precision={precision}
                    readOnly={readOnly}
                    size={size}
                    onChange={(_, nextValue) => onChange?.(nextValue)}
                />
            </FormControl>
        </div>
    );
};

export default Rating;
