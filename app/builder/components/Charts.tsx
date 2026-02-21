import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';

type ChartType = 'bar' | 'line' | 'pie';

type ChartsProps = {
    chartType?: ChartType;
    title?: string;
    labels?: string[];
    values?: number[];
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    color?: string;
    pointColors?: string[];
    lineCurve?: 'linear' | 'monotoneX' | 'step';
    xAxisLabel?: string;
    yAxisLabel?: string;
    pieInnerRadius?: number;
    className?: string;
    style?: React.CSSProperties;
};

const normalizeLabels = (labels?: string[]): string[] => {
    if (!Array.isArray(labels) || labels.length === 0) {
        return ['Jan', 'Feb', 'Mar', 'Apr'];
    }
    return labels.map((label, index) => `${label || `Item ${index + 1}`}`.trim());
};

const normalizeValues = (values: number[] | undefined, targetLength: number): number[] => {
    const source = Array.isArray(values) && values.length > 0 ? values : [12, 19, 8, 15];
    const parsed = source.map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0));
    if (parsed.length >= targetLength) return parsed.slice(0, targetLength);
    return [...parsed, ...Array.from({ length: targetLength - parsed.length }, () => 0)];
};

const DEFAULT_POINT_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

const normalizePointColors = (
    pointColors: string[] | undefined,
    targetLength: number,
    fallbackColor: string
): string[] => {
    const source = Array.isArray(pointColors) && pointColors.length > 0 ? pointColors : DEFAULT_POINT_COLORS;
    const sanitized = source.map((item) => `${item || fallbackColor}`.trim() || fallbackColor);
    const filled = Array.from({ length: targetLength }, (_, index) => sanitized[index % sanitized.length] || fallbackColor);
    return filled;
};

export const Charts = ({
    chartType = 'bar',
    title = 'Sales Overview',
    labels,
    values,
    height = 320,
    showLegend = true,
    showGrid = true,
    color = '#1976d2',
    pointColors,
    lineCurve = 'monotoneX',
    xAxisLabel = '',
    yAxisLabel = '',
    pieInnerRadius = 0,
    className = '',
    style
}: ChartsProps) => {
    const safeLabels = normalizeLabels(labels);
    const safeValues = normalizeValues(values, safeLabels.length);
    const safePointColors = normalizePointColors(pointColors, safeLabels.length, color);
    const width = Math.max(320, safeLabels.length * 90);

    return (
        <Box className={className} style={style}>
            {title && (
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {title}
                </Typography>
            )}

            {chartType === 'line' && (
                <LineChart
                    xAxis={[{ scaleType: 'point', data: safeLabels, label: xAxisLabel || undefined }]}
                    yAxis={[{ label: yAxisLabel || undefined }]}
                    series={[{
                        data: safeValues,
                        label: title || 'Series 1',
                        color,
                        curve: lineCurve,
                        colorGetter: ({ dataIndex }) => safePointColors[dataIndex] || color
                    }]}
                    width={width}
                    height={height}
                    hideLegend={!showLegend}
                    grid={{ horizontal: showGrid, vertical: showGrid }}
                />
            )}

            {chartType === 'pie' && (
                <PieChart
                    series={[
                        {
                            data: safeLabels.map((label, index) => ({
                                id: index,
                                value: safeValues[index] ?? 0,
                                label,
                                color: safePointColors[index] || color
                            })),
                            innerRadius: Math.max(0, pieInnerRadius)
                        }
                    ]}
                    width={width}
                    height={height}
                    hideLegend={!showLegend}
                />
            )}

            {chartType === 'bar' && (
                <BarChart
                    xAxis={[{ scaleType: 'band', data: safeLabels, label: xAxisLabel || undefined }]}
                    yAxis={[{ label: yAxisLabel || undefined }]}
                    series={[{
                        data: safeValues,
                        label: title || 'Series 1',
                        color,
                        colorGetter: ({ dataIndex }) => safePointColors[dataIndex] || color
                    }]}
                    width={width}
                    height={height}
                    hideLegend={!showLegend}
                    grid={{ horizontal: showGrid, vertical: showGrid }}
                />
            )}
        </Box>
    );
};
