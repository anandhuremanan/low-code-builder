import React from 'react';
import { Dialog as MuiDialog, type DialogProps, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export interface CustomDialogProps extends DialogProps {
    title: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
}

export const Dialog: React.FC<CustomDialogProps> = ({
    title,
    children,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onClose,
    ...props
}) => {
    return (
        <MuiDialog onClose={onClose} {...props}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => onClose()} color="inherit">
                    {cancelText}
                </Button>
                {onConfirm && (
                    <Button onClick={onConfirm} variant="contained" color="primary">
                        {confirmText}
                    </Button>
                )}
            </DialogActions>
        </MuiDialog>
    );
};
