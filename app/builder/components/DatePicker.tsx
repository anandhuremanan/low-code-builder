import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface DatePickerProps {
    caption?: string;
    label?: string;
    name?: string;
    helperText?: string;
    className?: string;
    style?: React.CSSProperties;
    value?: any;
    onChange?: (value: any) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    caption,
    label = 'Select Date',
    name,
    helperText,
    className,
    style,
    value,
    onChange
}) => {
    return (
        <div className={className} style={style}>
            {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
            <MuiDatePicker
                label={label}
                value={value ? dayjs(value) : null}
                onChange={onChange}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        name: name,
                        helperText: helperText,
                        variant: 'outlined'
                    }
                }}
            />
        </div>
    );
};
