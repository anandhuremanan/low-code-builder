import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { RadioGroup } from '../components/ui/RadioGroup';
import { Rating } from '../components/ui/Rating';
import { Switch } from '../components/ui/Switch';
import { Checkbox } from '../components/ui/Checkbox';
import { Typography } from '../components/ui/Typography';
import { type ComponentNode, type CustomStyle, type Page } from '../builder/types';
import { DataGrid } from '../builder/components/DataGrid';
import { MaterialIcon } from '../builder/components/MaterialIcon';
import { DatePicker } from '../builder/components/DatePicker';
import { Stepper } from '../builder/components/Stepper';
import { TimePicker } from '../builder/components/TimePicker';
import { DateTimePicker } from '../builder/components/DateTimePicker';
import { compileCustomStylesCss } from '../lib/customStyleUtils';

const PREVIEW_STORAGE_KEY = 'builder-preview-site';

type SiteSnapshot = {
    pages: Page[];
    currentPageId: string | null;
    viewMode?: 'desktop' | 'tablet' | 'mobile';
    customStyles?: CustomStyle[];
};

type MenuItem = {
    id: string;
    label: string;
    pageSlug?: string;
    children?: MenuItem[];
};

type TabItem = {
    id: string;
    label: string;
};

const sanitizePreviewContainerClassName = (className?: string): string => {
    if (!className) return '';
    const tokens = className.split(/\s+/).filter(Boolean);
    const hasDashedBorder = tokens.includes('border-dashed');

    return tokens
        .filter((token) => token !== 'border-dashed')
        .filter((token) => !/^border-gray-\d+$/.test(token))
        .filter((token) => !(hasDashedBorder && token === 'border'))
        .join(' ');
};

const PreviewMenu = ({ items }: { items: MenuItem[] }) => {
    return (
        <ul className="flex items-center gap-6">
            {items.map((item) => (
                <li key={item.id} className="relative group text-sm text-gray-700">
                    <a href={`/builder/preview?page=${encodeURIComponent(item.pageSlug || '/')}`} className="hover:text-blue-600">
                        {item.label}
                    </a>
                    {item.children && item.children.length > 0 && (
                        <ul className="absolute left-0 top-full z-20 mt-2 hidden min-w-50 rounded-md border border-gray-200 bg-white p-2 shadow-md group-hover:block">
                            {item.children.map((child) => (
                                <li key={child.id}>
                                    <a
                                        href={`/builder/preview?page=${encodeURIComponent(child.pageSlug || '/')}`}
                                        className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {child.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

const PreviewTabs = ({
    items,
    children,
    className,
    style,
    defaultValue = 0
}: {
    items: TabItem[];
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    defaultValue?: number;
}) => {
    const safeDefaultIndex = Math.min(Math.max(defaultValue, 0), Math.max(items.length - 1, 0));
    const [activeIndex, setActiveIndex] = useState(safeDefaultIndex);
    const currentChildren = React.Children.toArray(children);
    const activePanel = currentChildren[activeIndex] || null;

    return (
        <div className={className} style={style}>
            <div className="border-b border-gray-200">
                <div className="flex flex-wrap gap-1">
                    {items.map((item, index) => (
                        <button
                            key={item.id || String(index)}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeIndex === index
                                ? 'border-blue-600 text-blue-700 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="pt-4">
                {activePanel}
            </div>
        </div>
    );
};

const PreviewRadioGroupField = ({
    className,
    style,
    label,
    options,
    value,
    row
}: {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
    options: Array<{ label: string; value: string | number }>;
    value?: string | number;
    row?: boolean;
}) => {
    const initialValue = value ?? options?.[0]?.value ?? '';
    const [selectedValue, setSelectedValue] = useState<string | number>(initialValue);

    useEffect(() => {
        setSelectedValue(value ?? options?.[0]?.value ?? '');
    }, [value, options]);

    return (
        <RadioGroup
            className={className}
            style={style}
            label={label}
            options={options || []}
            value={selectedValue}
            row={Boolean(row)}
            onChange={(nextValue) => setSelectedValue(nextValue)}
        />
    );
};

const PreviewRatingField = ({
    className,
    style,
    label,
    value,
    max,
    precision,
    readOnly,
    size
}: {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
    value?: number | null;
    max?: number;
    precision?: number;
    readOnly?: boolean;
    size?: 'small' | 'medium' | 'large';
}) => {
    const [selectedValue, setSelectedValue] = useState<number | null>(value ?? 0);

    useEffect(() => {
        setSelectedValue(value ?? 0);
    }, [value]);

    return (
        <Rating
            className={className}
            style={style}
            label={label}
            value={selectedValue}
            max={max ?? 5}
            precision={precision ?? 1}
            readOnly={Boolean(readOnly)}
            size={size ?? 'medium'}
            onChange={(nextValue) => setSelectedValue(nextValue)}
        />
    );
};

const PreviewSwitchField = ({
    className,
    style,
    label,
    checked,
    size
}: {
    className?: string;
    style?: React.CSSProperties;
    label?: string;
    checked?: boolean;
    size?: 'small' | 'medium';
}) => {
    const [isChecked, setIsChecked] = useState(Boolean(checked));

    useEffect(() => {
        setIsChecked(Boolean(checked));
    }, [checked]);

    return (
        <Switch
            className={className}
            style={style}
            label={label}
            size={size || 'medium'}
            checked={isChecked}
            onChange={(event) => setIsChecked(event.target.checked)}
        />
    );
};

const resolveNodeClassName = (
    props: Record<string, any>,
    customStyleById: Map<string, CustomStyle>
): string => {
    const customStyleId = props?.customStyleId;
    if (typeof customStyleId === 'string' && customStyleById.has(customStyleId)) {
        return customStyleById.get(customStyleId)?.className || '';
    }
    return props?.className || '';
};

const PreviewNode = ({ node, customStyleById }: { node: ComponentNode; customStyleById: Map<string, CustomStyle> }) => {
    const childNodes = node.children.map((child) => <PreviewNode key={child.id} node={child} customStyleById={customStyleById} />);
    const menuItems = (node.props.menuItems || []) as MenuItem[];
    const resolvedClassName = resolveNodeClassName(node.props, customStyleById);

    switch (node.type) {
        case 'Container':
            return (
                <Box className={sanitizePreviewContainerClassName(resolvedClassName)} style={node.props.style}>
                    {childNodes}
                </Box>
            );
        case 'Header':
            return (
                <header
                    className={node.props.customStyleId
                        ? resolvedClassName
                        : `w-full px-6 py-4 bg-white border-b border-gray-200 ${resolvedClassName}`}
                    style={node.props.style}
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                        <div className="font-bold text-lg text-gray-900">{node.props.brand || 'My Site'}</div>
                        <nav>
                            <PreviewMenu items={menuItems} />
                        </nav>
                    </div>
                </header>
            );
        case 'Footer':
            return (
                <footer
                    className={node.props.customStyleId
                        ? resolvedClassName
                        : `w-full px-6 py-5 bg-gray-900 text-white ${resolvedClassName}`}
                    style={node.props.style}
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                        <p className="text-sm text-gray-200">{node.props.copyrightText || '© 2026 My Site'}</p>
                        <nav>
                            <ul className="flex items-center gap-4 text-sm text-gray-200">
                                {menuItems.map((item) => (
                                    <li key={item.id}>
                                        <a href={`/builder/preview?page=${encodeURIComponent(item.pageSlug || '/')}`} className="hover:text-white">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </footer>
            );
        case 'Text':
            return (
                <Typography
                    className={resolvedClassName}
                    style={node.props.style}
                    variant={node.props.variant}
                    component={node.props.component}
                >
                    {node.props.children}
                </Typography>
            );
        case 'Button': {
            const buttonHref = node.props.pageSlug
                ? `/builder/preview?page=${encodeURIComponent(node.props.pageSlug)}`
                : undefined;
            return (
                <Button
                    className={resolvedClassName}
                    style={node.props.style}
                    variant={node.props.variant}
                    icon={node.props.icon}
                    iconPos={node.props.iconPos}
                    component={buttonHref ? 'a' : undefined}
                    href={buttonHref}
                >
                    {node.props.children}
                </Button>
            );
        }
        case 'Input':
            return (
                <div className="flex flex-col gap-1 w-full">
                    {node.props.label && (
                        <label
                            className="text-sm font-medium text-gray-700"
                            style={node.props.labelColor ? { color: node.props.labelColor } : undefined}
                        >
                            {node.props.label}
                        </label>
                    )}
                    <Input
                        className={resolvedClassName}
                        style={node.props.style}
                        placeholder={node.props.placeholder}
                        size={node.props.size}
                        type={node.props.type || 'text'}
                        disableBorder={Boolean(node.props.disableBorder)}
                    />
                </div>
            );
        case 'Select':
            return (
                <Select
                    className={resolvedClassName}
                    label={node.props.label}
                    options={node.props.options || []}
                    style={node.props.style}
                    defaultValue={node.props.options?.[0]?.value}
                />
            );
        case 'MultiSelect':
            return (
                <MultiSelect
                    className={resolvedClassName}
                    label={node.props.label}
                    options={node.props.options || []}
                    style={node.props.style}
                    value={node.props.value || []}
                />
            );
        case 'RadioGroup':
            return (
                <PreviewRadioGroupField
                    className={resolvedClassName}
                    style={node.props.style}
                    label={node.props.label}
                    options={node.props.options || []}
                    value={node.props.value}
                    row={node.props.row}
                />
            );
        case 'Rating':
            return (
                <PreviewRatingField
                    className={resolvedClassName}
                    style={node.props.style}
                    label={node.props.label}
                    value={node.props.value}
                    max={node.props.max}
                    precision={node.props.precision}
                    readOnly={node.props.readOnly}
                    size={node.props.size}
                />
            );
        case 'Checkbox':
            return (
                <Checkbox
                    label={node.props.label}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'Switch':
            return (
                <PreviewSwitchField
                    className={resolvedClassName}
                    style={node.props.style}
                    label={node.props.label}
                    checked={node.props.checked}
                    size={node.props.size}
                />
            );
        case 'Image':
            return (
                <img
                    src={node.props.src || 'https://placehold.co/300x180'}
                    alt={node.props.alt || 'image'}
                    className={resolvedClassName || 'max-w-full h-auto'}
                    style={node.props.style}
                />
            );
        case 'Textarea':
            return (
                <textarea
                    className={resolvedClassName || 'border p-2 rounded w-full'}
                    style={node.props.style}
                    placeholder={node.props.placeholder}
                />
            );


        case 'MaterialIcon':
            return (
                <MaterialIcon
                    {...node.props}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'DataGrid':
            return (
                <DataGrid
                    {...node.props}
                    isPreview={true}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'DatePicker':
            return (
                <DatePicker
                    {...node.props}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'TimePicker':
            return (
                <TimePicker
                    {...node.props}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'DateTimePicker':
            return (
                <DateTimePicker
                    {...node.props}
                    className={resolvedClassName}
                    style={node.props.style}
                />
            );
        case 'Tabs':
            return (
                <PreviewTabs
                    items={(node.props.items || []) as TabItem[]}
                    defaultValue={node.props.defaultValue ?? 0}
                    className={resolvedClassName}
                    style={node.props.style}
                >
                    {childNodes}
                </PreviewTabs>
            );
        case 'Stepper':
            return (
                <Stepper
                    {...node.props}
                    className={resolvedClassName}
                >
                    {childNodes}
                </Stepper>
            );
        default:
            return null;

    }
};

export default function BuilderPreviewPage() {
    const [site, setSite] = useState<SiteSnapshot | null>(null);
    const location = useLocation();

    useEffect(() => {
        const raw = localStorage.getItem(PREVIEW_STORAGE_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw);
            if (parsed?.pages && Array.isArray(parsed.pages)) {
                setSite(parsed as SiteSnapshot);
                return;
            }

            // Backward compatibility with old single-page preview payload.
            if (parsed?.nodes) {
                const singlePage = parsed as Page;
                setSite({
                    pages: [singlePage],
                    currentPageId: singlePage.id
                });
                return;
            }

            setSite(null);
        } catch {
            setSite(null);
        }
    }, []);

    const selectedPage = useMemo(() => {
        if (!site) return null;
        const params = new URLSearchParams(location.search);
        const slug = params.get('page');
        if (slug) {
            return site.pages.find((page) => page.slug === slug) || null;
        }
        return site.pages.find((page) => page.id === site.currentPageId) || site.pages[0] || null;
    }, [site, location.search]);

    const customStyleById = useMemo(() => {
        const styles = site?.customStyles || [];
        return new Map(styles.map((style) => [style.id, style]));
    }, [site]);

    const customCss = useMemo(() => {
        return compileCustomStylesCss(site?.customStyles || []);
    }, [site]);

    const content = useMemo(() => {
        if (!selectedPage) return null;
        return selectedPage.nodes.map((node) => <PreviewNode key={node.id} node={node} customStyleById={customStyleById} />);
    }, [selectedPage, customStyleById]);

    if (!selectedPage) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Preview Unavailable</h1>
                    <p className="text-sm text-gray-600">
                        Open preview from the builder page after creating content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-auto bg-white">
            {customCss ? <style>{customCss}</style> : null}
            {content}
        </div>
    );
}
