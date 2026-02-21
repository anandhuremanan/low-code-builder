import React from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export type InputProps = TextFieldProps & {
    disableBorder?: boolean;
};

export const Input: React.FC<InputProps> = ({ disableBorder = false, ...props }) => {
    return (
        <TextField
            variant="outlined"
            fullWidth
            {...props}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    ...(disableBorder
                        ? {
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }
                        }
                        : {})
                },
                ...props.sx
            }}
        />
    );
};
