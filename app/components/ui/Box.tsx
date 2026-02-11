import React from 'react';
import { Box as MuiBox, type BoxProps } from '@mui/material';

export type CustomBoxProps = BoxProps;

// Box is a bit special in MUI as it handles system props directly and is often polymorphic.
// We wrap it simply here.
export const Box = React.forwardRef<unknown, CustomBoxProps>((props, ref) => {
    return <MuiBox ref={ref} {...props} />;
});

Box.displayName = 'Box';
