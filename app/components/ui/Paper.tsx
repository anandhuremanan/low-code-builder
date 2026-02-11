import React from 'react';
import { Paper as MuiPaper, type PaperProps } from '@mui/material';

export type CustomPaperProps = PaperProps;

export const Paper = React.forwardRef<HTMLDivElement, CustomPaperProps>((props, ref) => {
    return <MuiPaper ref={ref} {...props} />;
});

Paper.displayName = 'Paper';
