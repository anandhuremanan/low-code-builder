import React from 'react';
import { Typography as MuiTypography, type TypographyProps } from '@mui/material';

export type CustomTypographyProps = TypographyProps;

export const Typography = React.forwardRef<HTMLElement, CustomTypographyProps>((props, ref) => {
    return <MuiTypography ref={ref} {...props} />;
});

Typography.displayName = 'Typography';
