import { Link } from "react-router";
import { useBuilder } from "../builder/context";

export default function ConfigurePage() {
  const { state, dispatch } = useBuilder();
  const leftEnabled = state.siteSections.sidebarLeft.enabled;
  const rightEnabled = state.siteSections.sidebarRight.enabled;
  const sidebarPlacement =
    leftEnabled && rightEnabled
      ? "both"
      : leftEnabled
        ? "left"
        : rightEnabled
          ? "right"
          : "none";

  const handleSidebarPlacementChange = (value: string) => {
    if (value === "none") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: false },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: false },
      });
      return;
    }
    if (value === "left") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: true },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: false },
      });
      return;
    }
    if (value === "right") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: false },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: true },
      });
      return;
    }
    dispatch({
      type: "TOGGLE_SITE_SECTION",
      payload: { section: "sidebarLeft", enabled: true },
    });
    dispatch({
      type: "TOGGLE_SITE_SECTION",
      payload: { section: "sidebarRight", enabled: true },
    });
  };

  const sectionClass =
    "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm";
  const summaryClass =
    "cursor-pointer select-none list-none border-b border-slate-100 bg-slate-50/60 px-5 py-4 text-base font-semibold text-slate-900";
  const buttonLinkClass =
    "inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";
  const checkboxClass =
    "h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Site Setup
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Configure your layout
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Enable core sections, set sidebar placement, and open each area for
            deeper editing.
          </p>
        </div>

        <details open className={sectionClass}>
          <summary className={summaryClass}>Header</summary>
          <div className="space-y-4 p-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={state.siteSections.header.enabled}
                onChange={(e) =>
                  dispatch({
                    type: "TOGGLE_SITE_SECTION",
                    payload: { section: "header", enabled: e.target.checked },
                  })
                }
              />
              Header Enable
            </label>
            <Link to="/configure/header" className={buttonLinkClass}>
              Edit Header
            </Link>
          </div>
        </details>

        <details open className={sectionClass}>
          <summary className={summaryClass}>Footer</summary>
          <div className="space-y-4 p-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={state.siteSections.footer.enabled}
                onChange={(e) =>
                  dispatch({
                    type: "TOGGLE_SITE_SECTION",
                    payload: { section: "footer", enabled: e.target.checked },
                  })
                }
              />
              Footer Enable
            </label>
            <Link to="/configure/footer" className={buttonLinkClass}>
              Edit Footer
            </Link>
          </div>
        </details>

        <details open className={sectionClass}>
          <summary className={summaryClass}>Sidebar</summary>
          <div className="space-y-4 p-5">
            <div className="space-y-1">
              <label className="text-sm text-slate-700">
                Sidebar Placement:{" "}
              </label>
              <select
                className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                value={sidebarPlacement}
                onChange={(e) => handleSidebarPlacementChange(e.target.value)}
              >
                <option value="none">None</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </select>
            </div>

            {leftEnabled || rightEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leftEnabled ? (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Left Sidebar
                    </p>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={Boolean(
                          state.siteSections.sidebarLeft.collapsible,
                        )}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_SITE_SECTION",
                            payload: {
                              section: "sidebarLeft",
                              updates: { collapsible: e.target.checked },
                            },
                          })
                        }
                      />
                      Collapsible
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={Boolean(
                          state.siteSections.sidebarLeft.collapsedByDefault,
                        )}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_SITE_SECTION",
                            payload: {
                              section: "sidebarLeft",
                              updates: { collapsedByDefault: e.target.checked },
                            },
                          })
                        }
                      />
                      Collapsed by default
                    </label>
                    <Link
                      to="/configure/sidebar-left"
                      className={buttonLinkClass}
                    >
                      Edit Left Sidebar
                    </Link>
                  </div>
                ) : null}
                {rightEnabled ? (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Right Sidebar
                    </p>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={Boolean(
                          state.siteSections.sidebarRight.collapsible,
                        )}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_SITE_SECTION",
                            payload: {
                              section: "sidebarRight",
                              updates: { collapsible: e.target.checked },
                            },
                          })
                        }
                      />
                      Collapsible
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={Boolean(
                          state.siteSections.sidebarRight.collapsedByDefault,
                        )}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_SITE_SECTION",
                            payload: {
                              section: "sidebarRight",
                              updates: { collapsedByDefault: e.target.checked },
                            },
                          })
                        }
                      />
                      Collapsed by default
                    </label>
                    <Link
                      to="/configure/sidebar-right"
                      className={buttonLinkClass}
                    >
                      Edit Right Sidebar
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Enable a sidebar placement to configure sidebars.
              </p>
            )}
          </div>
        </details>

        <details open className={sectionClass}>
          <summary className={summaryClass}>Builder</summary>
          <div className="p-5">
            <Link to="/builder" className={buttonLinkClass}>
              Edit Builder
            </Link>
          </div>
        </details>
      </div>
    </main>
  );
}
