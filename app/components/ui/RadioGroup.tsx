import React from 'react';
import { FormControl, FormLabel, RadioGroup as MuiRadioGroup, FormControlLabel, Radio } from '@mui/material';

export interface Option {
  label: string;
  value: string | number;
}

export type CustomRadioGroupProps = {
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  fullWidth?: boolean;
  label?: string;
  name?: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  row?: boolean;
};

export const RadioGroup: React.FC<CustomRadioGroupProps> = ({
  className,
  style,
  caption,
  fullWidth = true,
  label,
  name,
  options,
  value,
  onChange,
  row = false
}) => {
  const handle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.((event.target as HTMLInputElement).value);
  };

  const wrapperStyle: React.CSSProperties = {
    minWidth: 0,
    ...(fullWidth ? { width: '100%' } : {}),
    ...(style || {})
  };

  return (
    <div className={className} style={wrapperStyle}>
      {caption && <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div>}
      <FormControl sx={{ width: fullWidth ? '100%' : undefined, minWidth: 0 }}>
        {label && <FormLabel>{label}</FormLabel>}
        <MuiRadioGroup name={name} value={value ?? ''} onChange={handle} row={row}>
          {options.map(opt => (
            <FormControlLabel key={String(opt.value)} value={opt.value} control={<Radio />} label={opt.label} />
          ))}
        </MuiRadioGroup>
      </FormControl>
    </div>
  );
};

export default RadioGroup;
