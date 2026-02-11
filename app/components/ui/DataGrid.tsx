import React from 'react';
import { DataGrid as MuiDataGrid, type DataGridProps } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export type CustomDataGridProps = DataGridProps;

export const DataGrid: React.FC<CustomDataGridProps> = (props) => {
    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <MuiDataGrid
                {...props}
                sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                    },
                    ...props.sx
                }}
            />
        </Box>
    );
};
