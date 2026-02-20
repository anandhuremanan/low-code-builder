import React from 'react';
import { FormControl, FormLabel, RadioGroup as MuiRadioGroup, FormControlLabel, Radio } from '@mui/material';

export interface Option {
  label: string;
  value: string | number;
}

export type CustomRadioGroupProps = {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  name?: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  row?: boolean;
};

export const RadioGroup: React.FC<CustomRadioGroupProps> = ({ className, style, label, name, options, value, onChange, row = false }) => {
  const handle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.((event.target as HTMLInputElement).value);
  };

  return (
    <FormControl className={className} style={style}>
      {label && <FormLabel>{label}</FormLabel>}
      <MuiRadioGroup name={name} value={value ?? ''} onChange={handle} row={row}>
        {options.map(opt => (
          <FormControlLabel key={String(opt.value)} value={opt.value} control={<Radio />} label={opt.label} />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};

export default RadioGroup;
