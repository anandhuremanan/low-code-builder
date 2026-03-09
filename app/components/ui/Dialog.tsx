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
        <MuiDialog
            onClose={onClose}
            {...props}
            PaperProps={{
                className: 'rounded-2xl border border-slate-200 shadow-lg',
                sx: {
                    borderRadius: '16px',
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff'
                }
            }}
        >
            <DialogTitle className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 text-base font-semibold text-slate-900">
                {title}
            </DialogTitle>
            <DialogContent className="px-6 py-5">
                {children}
            </DialogContent>
            <DialogActions className="border-t border-slate-200 bg-slate-50/50 px-6 py-3">
                <Button onClick={() => onClose()} color="inherit">
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
