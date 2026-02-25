import { Link } from 'react-router';
import { useBuilder } from '../builder/context';

export default function ConfigurePage() {
    const { state, dispatch } = useBuilder();

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
