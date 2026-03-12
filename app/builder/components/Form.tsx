import React from "react";
import { Box } from "../../components/ui/Box";
import { Button } from "../../components/ui/Button";
import { type ComponentNode } from "../types";

interface FormProps {
  node?: ComponentNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  submitButtonVariant?: "text" | "outlined" | "contained";
}

export const Form = ({
  node,
  children,
  className,
  style,
  showSubmitButton = true,
  submitButtonText = "Submit",
  submitButtonVariant = "contained",
}: FormProps) => {
  return (
    <Box
      component="form"
      className={className}
      style={style}
      onSubmit={(event: React.FormEvent) => {
        if (node) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-3">
        {children}
        {showSubmitButton ? (
          <div>
            <Button type="submit" variant={submitButtonVariant}>
              {submitButtonText}
            </Button>
          </div>
        ) : null}
      </div>
    </Box>
  );
};
