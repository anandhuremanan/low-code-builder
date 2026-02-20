import React from 'react';
import { FormControl, FormLabel, Rating as MuiRating } from '@mui/material';

export type CustomRatingProps = {
    className?: string;
    style?: React.CSSProperties;
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
    label,
    value = 0,
    max = 5,
    precision = 1,
    readOnly = false,
    size = 'medium',
    onChange
}) => {
    return (
        <FormControl className={className} style={style}>
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
    );
};

export default Rating;
