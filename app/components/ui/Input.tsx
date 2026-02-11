import React from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export type InputProps = TextFieldProps;

export const Input: React.FC<InputProps> = (props) => {
    return (
        <TextField
            variant="outlined"
            fullWidth
            {...props}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                },
                ...props.sx
            }}
        />
    );
};
