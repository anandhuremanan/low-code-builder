import React from 'react';
import { Snackbar as MuiSnackbar, type SnackbarProps, Alert, type AlertColor } from '@mui/material';

export interface CustomSnackbarProps extends Omit<SnackbarProps, 'open'> {
    open: boolean;
    message: string;
    severity?: AlertColor;
    onClose: () => void;
}

export const Snackbar: React.FC<CustomSnackbarProps> = ({
    open,
    message,
    severity = 'info',
    onClose,
    autoHideDuration = 6000,
    ...props
}) => {
    return (
        <MuiSnackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            {...props}
        >
            <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </MuiSnackbar>
    );
};
