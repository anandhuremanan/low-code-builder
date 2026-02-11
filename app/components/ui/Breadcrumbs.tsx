import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, type BreadcrumbsProps, Link, Typography } from '@mui/material';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface CustomBreadcrumbsProps extends BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ items, ...props }) => {
    return (
        <MuiBreadcrumbs aria-label="breadcrumb" {...props}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return isLast ? (
                    <Typography color="text.primary" key={item.label}>
                        {item.label}
                    </Typography>
                ) : (
                    <Link underline="hover" color="inherit" href={item.href} key={item.label}>
                        {item.label}
                    </Link>
                );
            })}
        </MuiBreadcrumbs>
    );
};
