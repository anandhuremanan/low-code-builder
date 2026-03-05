import { Link } from 'react-router';
import { useBuilder } from '../builder/context';

export default function ConfigurePage() {
    const { state, dispatch } = useBuilder();
    const leftEnabled = state.siteSections.sidebarLeft.enabled;
    const rightEnabled = state.siteSections.sidebarRight.enabled;
    const sidebarPlacement = leftEnabled && rightEnabled ? 'both' : leftEnabled ? 'left' : rightEnabled ? 'right' : 'none';

    const handleSidebarPlacementChange = (value: string) => {
        if (value === 'none') {
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarLeft', enabled: false } });
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarRight', enabled: false } });
            return;
        }
        if (value === 'left') {
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarLeft', enabled: true } });
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarRight', enabled: false } });
            return;
        }
        if (value === 'right') {
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarLeft', enabled: false } });
            dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarRight', enabled: true } });
            return;
        }
        dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarLeft', enabled: true } });
        dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'sidebarRight', enabled: true } });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">Configure</h1>

                <details open className="rounded-lg border border-gray-200 bg-white">
                    <summary className="cursor-pointer select-none list-none p-4 text-lg font-medium text-gray-900 border-b border-gray-100">
                        Header
                    </summary>
                    <div className="p-4 space-y-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={state.siteSections.header.enabled}
                                onChange={(e) => dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'header', enabled: e.target.checked } })}
                            />
                            Header Enable
                        </label>
                        <Link to="/configure/header" className="inline-flex text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                            Edit Header
                        </Link>
                    </div>
                </details>

                <details open className="rounded-lg border border-gray-200 bg-white">
                    <summary className="cursor-pointer select-none list-none p-4 text-lg font-medium text-gray-900 border-b border-gray-100">
                        Footer
                    </summary>
                    <div className="p-4 space-y-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={state.siteSections.footer.enabled}
                                onChange={(e) => dispatch({ type: 'TOGGLE_SITE_SECTION', payload: { section: 'footer', enabled: e.target.checked } })}
                            />
                            Footer Enable
                        </label>
                        <Link to="/configure/footer" className="inline-flex text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                            Edit Footer
                        </Link>
                    </div>
                </details>

                <details open className="rounded-lg border border-gray-200 bg-white">
                    <summary className="cursor-pointer select-none list-none p-4 text-lg font-medium text-gray-900 border-b border-gray-100">
                        Sidebar
                    </summary>
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-700">Sidebar Placement</label>
                            <select
                                className="w-full max-w-xs text-sm border rounded p-1 bg-white border-gray-300"
                                value={sidebarPlacement}
                                onChange={(e) => handleSidebarPlacementChange(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        {(leftEnabled || rightEnabled) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {leftEnabled ? (
                                    <div className="rounded border border-gray-200 p-3 space-y-3">
                                        <p className="text-sm font-medium text-gray-800">Left Sidebar</p>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(state.siteSections.sidebarLeft.collapsible)}
                                                onChange={(e) => dispatch({
                                                    type: 'UPDATE_SITE_SECTION',
                                                    payload: { section: 'sidebarLeft', updates: { collapsible: e.target.checked } }
                                                })}
                                            />
                                            Collapsible
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(state.siteSections.sidebarLeft.collapsedByDefault)}
                                                onChange={(e) => dispatch({
                                                    type: 'UPDATE_SITE_SECTION',
                                                    payload: { section: 'sidebarLeft', updates: { collapsedByDefault: e.target.checked } }
                                                })}
                                            />
                                            Collapsed by default
                                        </label>
                                        <Link to="/configure/sidebar-left" className="inline-flex text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                                            Edit Left Sidebar
                                        </Link>
                                    </div>
                                ) : null}
                                {rightEnabled ? (
                                    <div className="rounded border border-gray-200 p-3 space-y-3">
                                        <p className="text-sm font-medium text-gray-800">Right Sidebar</p>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(state.siteSections.sidebarRight.collapsible)}
                                                onChange={(e) => dispatch({
                                                    type: 'UPDATE_SITE_SECTION',
                                                    payload: { section: 'sidebarRight', updates: { collapsible: e.target.checked } }
                                                })}
                                            />
                                            Collapsible
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(state.siteSections.sidebarRight.collapsedByDefault)}
                                                onChange={(e) => dispatch({
                                                    type: 'UPDATE_SITE_SECTION',
                                                    payload: { section: 'sidebarRight', updates: { collapsedByDefault: e.target.checked } }
                                                })}
                                            />
                                            Collapsed by default
                                        </label>
                                        <Link to="/configure/sidebar-right" className="inline-flex text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                                            Edit Right Sidebar
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Enable a sidebar placement to configure sidebars.</p>
                        )}
                    </div>
                </details>

                <details open className="rounded-lg border border-gray-200 bg-white">
                    <summary className="cursor-pointer select-none list-none p-4 text-lg font-medium text-gray-900 border-b border-gray-100">
                        Builder
                    </summary>
                    <div className="p-4">
                        <Link to="/builder" className="inline-flex text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50">
                            Edit Builder
                        </Link>
                    </div>
                </details>
            </div>
        </div>
    );
}
