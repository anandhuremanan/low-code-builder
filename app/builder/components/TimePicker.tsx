import React, { useEffect, useState } from 'react';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

interface TimePickerProps {
    label?: string;
    name?: string;
    helperText?: string;
    className?: string;
    style?: React.CSSProperties;
    value?: any;
    onChange?: (value: any) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
    label = 'Select Time',
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
            <MuiTimePicker
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
