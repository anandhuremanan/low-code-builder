import React, { useEffect, useMemo, useState } from 'react';
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
    dataSource?: 'manual' | 'api' | 'json';
    apiUrl?: string;
    jsonData?: string;
    dataPath?: string;
    xAxisKey?: string;
    yAxisKey?: string;
    colorKey?: string;
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

const getValueByPath = (source: unknown, path: string): unknown => {
    if (!path.trim()) return source;
    const segments = path
        .split('.')
        .map((segment) => segment.trim())
        .filter(Boolean);
    return segments.reduce<unknown>((acc, segment) => {
        if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[segment];
        }
        return undefined;
    }, source);
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
    dataSource = 'manual',
    apiUrl = '',
    jsonData = '',
    dataPath = '',
    xAxisKey = '',
    yAxisKey = '',
    colorKey = '',
    className = '',
    style
}: ChartsProps) => {
    const [apiRows, setApiRows] = useState<Record<string, unknown>[]>([]);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (dataSource !== 'api' || !apiUrl.trim()) {
            setApiRows([]);
            setApiError('');
            return;
        }
        let active = true;
        const controller = new AbortController();
        const cacheKey = `chart-api-cache:${apiUrl.trim()}|${dataPath.trim()}|${xAxisKey.trim()}|${yAxisKey.trim()}`;

        const parseRetryAfterMs = (headerValue: string | null): number => {
            if (!headerValue) return 0;
            const seconds = Number(headerValue);
            if (Number.isFinite(seconds) && seconds > 0) {
                return seconds * 1000;
            }
            return 0;
        };

        const fetchWithRetry = async (url: string, maxRetries = 2): Promise<Response> => {
            let attempt = 0;
            while (true) {
                const response = await fetch(url, { signal: controller.signal });
                if (response.status !== 429 || attempt >= maxRetries) {
                    return response;
                }
                const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'));
                const backoffMs = retryAfterMs || (attempt + 1) * 1200;
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                attempt += 1;
            }
        };

        const run = async () => {
            try {
                setApiError('');
                const response = await fetchWithRetry(apiUrl);
                if (!response.ok) {
                    if (response.status === 429) {
                        const cached = sessionStorage.getItem(cacheKey);
                        if (cached) {
                            const parsedCache = JSON.parse(cached);
                            const cachedRows = Array.isArray(parsedCache) ? parsedCache : [];
                            if (!active) return;
                            setApiRows(cachedRows.filter((row) => row && typeof row === 'object') as Record<string, unknown>[]);
                            setApiError('API rate limit reached (429). Showing cached data.');
                            return;
                        }
                        throw new Error('API rate limit reached (429).');
                    }
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const payload = await response.json();
                const resolved = dataPath.trim() ? getValueByPath(payload, dataPath) : payload;
                const rows = Array.isArray(resolved) ? resolved : [];
                if (!active) return;
                const normalizedRows = rows.filter((row) => row && typeof row === 'object') as Record<string, unknown>[];
                setApiRows(normalizedRows);
                sessionStorage.setItem(cacheKey, JSON.stringify(normalizedRows));
                if (!Array.isArray(resolved)) {
                    setApiError('API response did not resolve to an array. Falling back to manual data.');
                }
            } catch (error) {
                if (!active) return;
                setApiRows([]);
                setApiError('Failed to fetch API data. Falling back to manual data.');
                console.error(error);
            }
        };
        const debounceTimer = window.setTimeout(run, 400);
        return () => {
            active = false;
            controller.abort();
            window.clearTimeout(debounceTimer);
        };
    }, [apiUrl, dataPath, dataSource, xAxisKey, yAxisKey]);

    const jsonRowsState = useMemo(() => {
        if (dataSource !== 'json') return { rows: [] as Record<string, unknown>[], error: '' };
        if (!jsonData.trim()) return { rows: [] as Record<string, unknown>[], error: 'JSON input is empty. Falling back to manual data.' };
        try {
            const payload = JSON.parse(jsonData);
            const resolved = dataPath.trim() ? getValueByPath(payload, dataPath) : payload;
            if (!Array.isArray(resolved)) {
                return { rows: [] as Record<string, unknown>[], error: 'JSON path did not resolve to an array. Falling back to manual data.' };
            }
            return {
                rows: resolved.filter((row) => row && typeof row === 'object') as Record<string, unknown>[],
                error: ''
            };
        } catch {
            return { rows: [] as Record<string, unknown>[], error: 'Invalid JSON input. Falling back to manual data.' };
        }
    }, [dataPath, dataSource, jsonData]);

    const mappedData = useMemo(() => {
        const sourceRows =
            dataSource === 'api'
                ? apiRows
                : dataSource === 'json'
                    ? jsonRowsState.rows
                    : [];
        if (!sourceRows.length || !xAxisKey.trim() || !yAxisKey.trim()) return null;

        const mappedLabels = sourceRows.map((row, index) => {
            const raw = row[xAxisKey] ?? `Item ${index + 1}`;
            return String(raw).trim() || `Item ${index + 1}`;
        });
        const mappedValues = sourceRows.map((row) => {
            const raw = Number(row[yAxisKey]);
            return Number.isFinite(raw) ? raw : 0;
        });
        const mappedColors = colorKey.trim()
            ? sourceRows.map((row) => {
                const raw = row[colorKey];
                return typeof raw === 'string' && raw.trim() ? raw.trim() : color;
            })
            : [];

        return { labels: mappedLabels, values: mappedValues, colors: mappedColors };
    }, [apiRows, color, colorKey, dataSource, jsonRowsState.rows, xAxisKey, yAxisKey]);

    const sourceError = dataSource === 'api' ? apiError : dataSource === 'json' ? jsonRowsState.error : '';

    const safeLabels = normalizeLabels(mappedData?.labels || labels);
    const safeValues = normalizeValues(mappedData?.values || values, safeLabels.length);
    const safePointColors = normalizePointColors(mappedData?.colors?.length ? mappedData.colors : pointColors, safeLabels.length, color);
    const width = Math.max(360, safeLabels.length * 70);
    const xLabelFormatter = (label: string | number): string => {
        const text = String(label ?? '');
        return text.length > 14 ? `${text.slice(0, 12)}...` : text;
    };
    const yLabelFormatter = (value: number | null): string => {
        const numeric = Number(value ?? 0);
        if (!Number.isFinite(numeric)) return '';
        if (Math.abs(numeric) >= 1000) {
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(numeric).toUpperCase();
        }
        return numeric.toLocaleString('en-US');
    };

    return (
        <Box className={className} style={style} sx={{ width: '100%', overflowX: chartType === 'pie' ? 'hidden' : 'auto' }}>
            {title && (
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                    {title}
                </Typography>
            )}
            {sourceError && (
                <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'error.main' }}>
                    {sourceError}
                </Typography>
            )}

            {chartType === 'line' && (
                <LineChart
                    xAxis={[{
                        scaleType: 'point',
                        data: safeLabels,
                        label: xAxisLabel || undefined,
                        tickLabelInterval: () => true,
                        valueFormatter: xLabelFormatter,
                        height: 56
                    }]}
                    yAxis={[{
                        label: yAxisLabel || undefined,
                        valueFormatter: yLabelFormatter
                    }]}
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
                    margin={{ top: 16, right: 20, bottom: 72, left: 76 }}
                />
            )}

            {chartType === 'pie' && (
                <Box>
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
                        width={Math.max(360, Math.min(width, 900))}
                        height={height}
                        hideLegend
                    />
                    {showLegend && (
                        <Box
                            sx={{
                                mt: 1,
                                maxHeight: 120,
                                overflowY: 'auto',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                pt: 1,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: 0.75
                            }}
                        >
                            {safeLabels.map((label, index) => (
                                <Box
                                    key={`${label}-${index}`}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
                                    title={`${label}: ${safeValues[index] ?? 0}`}
                                >
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            bgcolor: safePointColors[index] || color,
                                            flexShrink: 0
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {chartType === 'bar' && (
                <BarChart
                    xAxis={[{
                        scaleType: 'band',
                        data: safeLabels,
                        label: xAxisLabel || undefined,
                        tickLabelInterval: () => true,
                        valueFormatter: xLabelFormatter,
                        height: 56
                    }]}
                    yAxis={[{
                        label: yAxisLabel || undefined,
                        valueFormatter: yLabelFormatter
                    }]}
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
                    margin={{ top: 16, right: 20, bottom: 72, left: 76 }}
                />
            )}
        </Box>
    );
};
