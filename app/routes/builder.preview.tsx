import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Box } from '../components/ui/Box';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Checkbox } from '../components/ui/Checkbox';
import { Typography } from '../components/ui/Typography';
import { type ComponentNode, type Page } from '../builder/types';
import { DataGrid } from '../builder/components/DataGrid';
import { MaterialIcon } from '../builder/components/MaterialIcon';
import { DatePicker } from '../builder/components/DatePicker';

const PREVIEW_STORAGE_KEY = 'builder-preview-site';

type SiteSnapshot = {
    pages: Page[];
    currentPageId: string | null;
    viewMode?: 'desktop' | 'tablet' | 'mobile';
};

type MenuItem = {
    id: string;
    label: string;
    pageSlug?: string;
    children?: MenuItem[];
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

const PreviewNode = ({ node }: { node: ComponentNode }) => {
    const childNodes = node.children.map((child) => <PreviewNode key={child.id} node={child} />);
    const menuItems = (node.props.menuItems || []) as MenuItem[];

    switch (node.type) {
        case 'Container':
            return (
                <Box className={sanitizePreviewContainerClassName(node.props.className)} style={node.props.style}>
                    {childNodes}
                </Box>
            );
        case 'Header':
            return (
                <header className={`w-full px-6 py-4 bg-white border-b border-gray-200 ${node.props.className || ''}`} style={node.props.style}>
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
                <footer className={`w-full px-6 py-5 bg-gray-900 text-white ${node.props.className || ''}`} style={node.props.style}>
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
                    className={node.props.className}
                    style={node.props.style}
                    variant={node.props.variant}
                    component={node.props.component}
                >
                    {node.props.children}
                </Typography>
            );
        case 'Button':
            return (
                <Button
                    className={node.props.className}
                    style={node.props.style}
                    variant={node.props.variant}
                    icon={node.props.icon}
                    iconPos={node.props.iconPos}
                >
                    {node.props.children}
                </Button>
            );
        case 'Input':
            return (
                <div className="flex flex-col gap-1 w-full">
                    {node.props.label && (
                        <label className="text-sm font-medium text-gray-700">
                            {node.props.label}
                        </label>
                    )}
                    <Input
                        className={node.props.className}
                        style={node.props.style}
                        placeholder={node.props.placeholder}
                        size={node.props.size}
                        type={node.props.type || 'text'}
                    />
                </div>
            );
        case 'Select':
            return (
                <Select
                    className={node.props.className}
                    label={node.props.label}
                    options={node.props.options || []}
                    style={node.props.style}
                    defaultValue={node.props.options?.[0]?.value}
                />
            );
        case 'MultiSelect':
            return (
                <MultiSelect
                    className={node.props.className}
                    label={node.props.label}
                    options={node.props.options || []}
                    style={node.props.style}
                    value={node.props.value || []}
                />
            );
        case 'Checkbox':
            return (
                <Checkbox
                    label={node.props.label}
                    className={node.props.className}
                    style={node.props.style}
                />
            );
        case 'Image':
            return (
                <img
                    src={node.props.src || 'https://placehold.co/300x180'}
                    alt={node.props.alt || 'image'}
                    className={node.props.className || 'max-w-full h-auto'}
                    style={node.props.style}
                />
            );
        case 'Textarea':
            return (
                <textarea
                    className={node.props.className || 'border p-2 rounded w-full'}
                    style={node.props.style}
                    placeholder={node.props.placeholder}
                />
            );


        case 'MaterialIcon':
            return (
                <MaterialIcon
                    {...node.props}
                    className={node.props.className}
                    style={node.props.style}
                />
            );
        case 'DataGrid':
            return (
                <DataGrid
                    {...node.props}
                    isPreview={true}
                    className={node.props.className}
                    style={node.props.style}
                />
            );
        case 'DatePicker':
            return (
                <DatePicker
                    {...node.props}
                    className={node.props.className}
                    style={node.props.style}
                />
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

    const content = useMemo(() => {
        if (!selectedPage) return null;
        return selectedPage.nodes.map((node) => <PreviewNode key={node.id} node={node} />);
    }, [selectedPage]);

    const widthClass = {
        desktop: 'w-full max-w-6xl',
        tablet: 'w-[768px]',
        mobile: 'w-[375px]'
    }[site?.viewMode || 'desktop'] || 'w-full max-w-6xl';

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
        <div className="h-screen bg-gray-100 p-8 overflow-auto flex justify-center">
            <div className={`${widthClass} min-h-[80vh] bg-white shadow-sm transition-all duration-300 ease-in-out`}>
                {content}
            </div>
        </div>
    );
}
