import React from 'react';
import { Autocomplete as MuiAutocomplete, TextField, type AutocompleteProps as MuiAutocompleteProps, type AutocompleteRenderInputParams } from '@mui/material';

export interface CustomAutocompleteProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> extends Omit<MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'> {
    label?: string;
    placeholder?: string;
    helperText?: string;
    error?: boolean;
}

// We need a generic component for Autocomplete to handle options correctly
export const Autocomplete = <
    T,
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined,
    FreeSolo extends boolean | undefined = undefined
>(
    props: CustomAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>
) => {
    const { label, placeholder, helperText, error, ...autocompleteProps } = props;

    return (
        <MuiAutocomplete
            filterSelectedOptions
            {...autocompleteProps}
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    helperText={helperText}
                    error={error}
                />
            )}
        />
    );
};
