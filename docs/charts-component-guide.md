# Charts Component (MUI X Charts) in Builder

This guide explains how `Charts` was added as a builder component with multiple chart types.

## Supported chart types

- `bar`
- `line`
- `pie`

## Files added/updated

1. Component implementation:
- `app/builder/components/Charts.tsx`

2. Type registration:
- `app/builder/types.ts`
- Added `"Charts"` in `ComponentType`.

3. Builder registry:
- `app/builder/registry.tsx`
- Added `Charts` registry entry and default props.

4. Properties panel controls:
- `app/builder/components/PropertiesPanel.tsx`
- Added chart settings for:
  - title
  - chart type
  - height
  - labels (CSV)
  - values (CSV)
  - show legend
  - show grid (bar/line)
  - x-axis label (bar/line)
  - y-axis label (bar/line)
  - line curve (line)
  - pie inner radius for donut mode (pie)
  - separate color per day/category (`pointColors`)
  - primary color

5. Preview support:
- `app/routes/builder.preview.tsx`
- Added `Charts` case in preview renderer.

## Default props

```ts
{
  chartType: 'bar',
  title: 'Sales Overview',
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  values: [12, 19, 8, 15],
  height: 320,
  showLegend: true,
  showGrid: true,
  color: '#1976d2',
  pointColors: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'],
  lineCurve: 'monotoneX',
  xAxisLabel: '',
  yAxisLabel: '',
  pieInnerRadius: 0,
  className: 'w-full'
}
```

## How to use

1. Open Builder and drag `Charts` from sidebar.
2. Select the chart on canvas.
3. Use Properties panel to switch chart type and update labels/values.
4. Click Preview to verify chart rendering in `builder.preview`.

## Dependency

`Charts.tsx` uses:

- `@mui/x-charts`

Install dependency if missing:

```bash
npm install @mui/x-charts
```
