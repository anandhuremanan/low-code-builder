import React, { useEffect, useState } from 'react';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

interface DateTimePickerProps {
    caption?: string;
    label?: string;
    name?: string;
    helperText?: string;
    className?: string;
    style?: React.CSSProperties;
    value?: any;
    onChange?: (value: any) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    caption,
    label = 'Select Date & Time',
    name,
    helperText,
    className,
    style,
    value,
    onChange
}) => {
    const [localValue, setLocalValue] = useState<any>(value ? dayjs(value) : null);

    useEffect(() => {
        setLocalValue(value ? dayjs(value) : null);
    }, [value]);

    const handleChange = (nextValue: any) => {
        if (onChange) {
            onChange(nextValue);
            return;
        }
        setLocalValue(nextValue);
    };

    return (
        <div className={className} style={style}>
            {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
            <MuiDateTimePicker
                label={label}
                value={onChange ? (value ? dayjs(value) : null) : localValue}
                onChange={handleChange}
                timeSteps={{ minutes: 1 }}
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
