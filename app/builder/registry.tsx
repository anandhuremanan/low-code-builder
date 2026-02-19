
import React from 'react';
import {
    Box as BoxIcon,
    Type as TextIcon,
    MousePointer2 as ButtonIcon,
    TextCursorInput as InputIcon,
    List as SelectIcon,
    CheckSquare as CheckboxIcon,
    Layout as ContainerIcon,
    Table as TableIcon,
    Star as StarIcon,
    Calendar as CalendarIcon
} from 'lucide-react';
import { type RegisteredComponent, type ComponentType } from './types';

// Import existing UI components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Box } from '../components/ui/Box';
import { Typography } from '../components/ui/Typography';
import { DataGrid } from './components/DataGrid';
import { Container } from './components/Container';
import { Tabs } from './components/Tabs';
import { MaterialIcon } from './components/MaterialIcon';
import { DatePicker } from './components/DatePicker';
import { MultiSelect } from '../components/ui/MultiSelect';

export const COMPONENT_REGISTRY: Record<ComponentType, RegisteredComponent> = {
    Container: {
        name: 'Container',
        icon: ContainerIcon,
        component: Container,
        defaultProps: {
            className: 'p-4 border border-dashed border-gray-300 w-full',
        },
    },
    Header: {
        name: 'Header',
        icon: ContainerIcon,
        component: ({ brand, menuItems = [], onNavigateToPageSlug, ...props }: any) => (
            <header
                {...props}
                className={`w-full px-6 py-4 bg-white border-b border-gray-200 ${props.className || ''}`}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                    <div className="font-bold text-lg text-gray-900">{brand || 'My Site'}</div>
                    <nav>
                        <ul className="flex items-center gap-6">
                            {menuItems.map((item: any) => (
                                <li key={item.id} className="relative group text-sm text-gray-700">
                                    <button
                                        type="button"
                                        className="hover:text-blue-600"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (item.pageSlug && onNavigateToPageSlug) {
                                                onNavigateToPageSlug(item.pageSlug);
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                    {item.children?.length > 0 && (
                                        <ul className="absolute left-0 top-full mt-2 hidden min-w-[180px] rounded-md border border-gray-200 bg-white p-2 shadow-md group-hover:block">
                                            {item.children.map((child: any) => (
                                                <li key={child.id} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                                                    <button
                                                        type="button"
                                                        className="w-full text-left"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            if (child.pageSlug && onNavigateToPageSlug) {
                                                                onNavigateToPageSlug(child.pageSlug);
                                                            }
                                                        }}
                                                    >
                                                        {child.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>
        ),
        defaultProps: {
            brand: 'My Site',
            className: '',
            menuItems: [
                { id: 'menu-home', label: 'Home', pageSlug: '/', children: [] },
                {
                    id: 'menu-services',
                    label: 'Services',
                    pageSlug: '/',
                    children: [
                        { id: 'submenu-design', label: 'Design', pageSlug: '/' },
                        { id: 'submenu-dev', label: 'Development', pageSlug: '/' }
                    ]
                },
                { id: 'menu-contact', label: 'Contact', pageSlug: '/', children: [] }
            ]
        },
    },
    Footer: {
        name: 'Footer',
        icon: ContainerIcon,
        component: ({ copyrightText, menuItems = [], onNavigateToPageSlug, ...props }: any) => (
            <footer
                {...props}
                className={`w-full px-6 py-5 bg-gray-900 text-white ${props.className || ''}`}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                    <p className="text-sm text-gray-200">{copyrightText || '© 2026 My Site'}</p>
                    <ul className="flex items-center gap-4 text-sm text-gray-200">
                        {menuItems.map((item: any) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className="hover:text-white"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (item.pageSlug && onNavigateToPageSlug) {
                                            onNavigateToPageSlug(item.pageSlug);
                                        }
                                    }}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </footer>
        ),
        defaultProps: {
            className: '',
            copyrightText: '© 2026 My Site',
            menuItems: [
                { id: 'footer-privacy', label: 'Privacy', pageSlug: '/', children: [] },
                { id: 'footer-terms', label: 'Terms', pageSlug: '/', children: [] }
            ]
        },
    },
    Button: {
        name: 'Button',
        icon: ButtonIcon,
        component: ({ pageSlug, onNavigateToPageSlug, onClick, ...props }: any) => (
            <Button
                {...props}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    if (pageSlug && onNavigateToPageSlug) {
                        onNavigateToPageSlug(pageSlug);
                        return;
                    }
                    onClick?.(event);
                }}
            />
        ),
        defaultProps: {
            children: 'Button',
            variant: 'contained',
            className: '',
            icon: '',
            iconPos: 'start',
            pageSlug: ''
        },
    },
    Input: {
        name: 'Input',
        icon: InputIcon,
        component: ({ label, type, labelColor, ...props }: any) => (
            <div className="flex flex-col gap-1 w-full">
                {label && (
                    <label className="text-sm font-medium text-gray-700" style={labelColor ? { color: labelColor } : undefined}>
                        {label}
                    </label>
                )}
                <Input {...props} type={type || 'text'} />
            </div>
        ),
        defaultProps: {
            label: 'Input Label',
            labelColor: '#374151',
            type: 'text',
            placeholder: 'Enter text...',
            className: '',
            fullWidth: false,
        },
    },
    Text: {
        name: 'Text',
        icon: TextIcon,
        component: Typography,
        defaultProps: {
            children: 'Double click to edit text',
            variant: 'inherit',
            className: 'text-base text-gray-800',
        },
    },
    Select: {
        name: 'Select',
        icon: SelectIcon,
        component: ({ options, ...props }: any) => (
            <Select {...props} options={options || []} />
        ),
        defaultProps: {
            label: 'Select Option',
            className: '',
            fullWidth: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' }
            ]
        },
    },
    Checkbox: {
        name: 'Checkbox',
        icon: CheckboxIcon,
        component: Checkbox,
        defaultProps: {
            label: 'Check me',
        },
    },
    Image: {
        name: 'Image',
        icon: BoxIcon, // Default icon
        component: ({ src, alt, className, ...props }: any) => (
            <img
                src={src || "https://placehold.co/150"}
                alt={alt || "placeholder"}
                className={`max-w-full ${className || ''}`}
                {...props}
            />
        ),
        defaultProps: {},
    },
    Textarea: {
        name: 'Textarea',
        icon: TextIcon,
        component: ({ className, ...props }: any) => <textarea {...props} className={className || "border p-2 rounded"} />,
        defaultProps: {
            placeholder: 'Enter long text...',
            className: ''
        }
    },
    DataGrid: {
        name: 'DataGrid',
        icon: TableIcon,
        component: DataGrid,
        defaultProps: {
            className: '',
            apiUrl: '',
            columns: [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'firstName', headerName: 'First name', width: 130 },
                { field: 'lastName', headerName: 'Last name', width: 130 },
            ],
            style: { width: '100%', height: '400px' }
        }
    },
    MaterialIcon: {
        name: 'MaterialIcon',
        icon: StarIcon,
        component: MaterialIcon,
        defaultProps: {
            icon: 'home',
            className: 'text-gray-800 text-4xl',
            style: { fontSize: '40px' }
        }
    },
    DatePicker: {
        name: 'DatePicker',
        icon: CalendarIcon,
        component: DatePicker,
        defaultProps: {
            label: 'Select Date',
            className: '',
            helperText: ''
        }
    },
    MultiSelect: {
        name: 'MultiSelect',
        icon: SelectIcon,
        component: ({ options, ...props }: any) => (
            <MultiSelect {...props} options={options || []} />
        ),
        defaultProps: {
            label: 'Multi Select',
            className: '',
            fullWidth: false,
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' }
            ],
            value: []
        },
    },
    Tabs: {
        name: 'Tabs',
        icon: ContainerIcon,
        component: Tabs,
        defaultProps: {
            items: [
                { label: 'Tab 1', id: 'tab1' },
                { label: 'Tab 2', id: 'tab2' }
            ],
            defaultValue: 0,
            className: ''
        }
    }
};
