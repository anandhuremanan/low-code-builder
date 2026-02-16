import React, { useEffect, useState } from 'react';
import { DataGrid as MuiDataGrid, type GridColDef } from '@mui/x-data-grid';
import { cn } from '../../lib/utils';

interface DataGridProps {
    className?: string;
    style?: React.CSSProperties;
    apiUrl?: string;
    columns?: GridColDef[];
    dummyData?: any[];
    isPreview?: boolean;
}

const DEFAULT_COLUMNS: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    { field: 'age', headerName: 'Age', type: 'number', width: 90 },
];

const DEFAULT_ROWS = [
    { id: 1, firstName: 'Jon', lastName: 'Snow', age: 35 },
    { id: 2, firstName: 'Cersei', lastName: 'Lannister', age: 42 },
    { id: 3, firstName: 'Jaime', lastName: 'Lannister', age: 45 },
    { id: 4, firstName: 'Arya', lastName: 'Stark', age: 16 },
    { id: 5, firstName: 'Daenerys', lastName: 'Targaryen', age: null },
];

export const DataGrid: React.FC<DataGridProps> = ({
    className,
    style,
    apiUrl,
    columns = DEFAULT_COLUMNS,
    dummyData,
    isPreview = false
}) => {
    const [rows, setRows] = useState<any[]>(DEFAULT_ROWS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!apiUrl) {
                setRows(dummyData || DEFAULT_ROWS);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();

                // transform data if necessary, expect array of objects
                // and ensure they have 'id'
                const rowsWithId = Array.isArray(data)
                    ? data.map((item, index) => ({ id: item.id || index, ...item }))
                    : [];

                setRows(rowsWithId);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
                if (!isPreview) {
                    setRows(dummyData || DEFAULT_ROWS);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, dummyData, isPreview]);

    // Format columns from props if they are just objects
    const formattedColumns: GridColDef[] = columns.map(col => ({
        field: col.field,
        headerName: col.headerName || col.field,
        width: col.width || 150,
        editable: true
    }));

    return (
        <div className={cn("h-[400px] w-full bg-white", className)} style={style}>
            {error && !isPreview && <div className="text-red-500 text-xs p-2">{error} (using dummy data)</div>}
            <MuiDataGrid
                rows={rows}
                columns={formattedColumns.length > 0 ? formattedColumns : DEFAULT_COLUMNS}
                loading={loading}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />
        </div>
    );
};
