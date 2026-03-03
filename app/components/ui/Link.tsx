import React from "react";
import { Link as MuiLink, type LinkProps as MuiLinkProps } from "@mui/material";

export interface CustomLinkProps extends MuiLinkProps {
  label?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ label, children, ...props }, ref) => {
    return (
      <MuiLink ref={ref} {...props}>
        {label || children}
      </MuiLink>
    );
  },
);

Link.displayName = "Link";
