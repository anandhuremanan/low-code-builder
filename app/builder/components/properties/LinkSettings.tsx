import React from "react";
import { Input } from "../../../components/ui/Input";
import { Plus, Trash2 } from "lucide-react";
import type { NodeProperties } from "./useNodeProperties";

export const LinkSettings = ({ p }: { p: NodeProperties }) => {
  const linkType = p.localProps.linkType || "internal";
  const enableHoverMenu = Boolean(p.localProps.enableHoverMenu);
  const hoverMenuLayout = p.localProps.hoverMenuLayout || "dropdown";
  const hoverMenuItems = Array.isArray(p.localProps.hoverMenuItems)
    ? p.localProps.hoverMenuItems
    : [];

  const updateHoverMenuItems = (items: any[]) => {
    p.handleChange("hoverMenuItems", items);
  };

  const addHoverMenuItem = () => {
    const nextItems = [...hoverMenuItems];
    nextItems.push({
      id: `hover-menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `Menu Link ${nextItems.length + 1}`,
      linkType: "internal",
      pageSlug: p.pageOptions[0]?.value || "/",
      externalUrl: "",
      openInNewTab: true,
    });
    updateHoverMenuItems(nextItems);
  };

  const removeHoverMenuItem = (index: number) => {
    const nextItems = [...hoverMenuItems];
    nextItems.splice(index, 1);
    updateHoverMenuItems(nextItems);
  };

  const updateHoverMenuItem = (index: number, key: string, value: any) => {
    const nextItems = [...hoverMenuItems];
    const current = nextItems[index];
    if (!current) return;
    nextItems[index] = { ...current, [key]: value };
    updateHoverMenuItems(nextItems);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Link Settings
      </label>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Link Type</label>
        <select
          className="w-full text-sm border rounded p-1 bg-white border-gray-300"
          value={linkType}
          onChange={(e) => p.handleChange("linkType", e.target.value)}
        >
          <option value="internal">Builder Page</option>
          <option value="external">External URL</option>
        </select>
      </div>

      {linkType === "internal" ? (
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Page</label>
          <select
            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
            value={p.localProps.pageSlug || ""}
            onChange={(e) => p.handleChange("pageSlug", e.target.value)}
          >
            <option value="">No Link</option>
            {p.pageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">External URL</label>
            <Input
              size="small"
              value={p.localProps.externalUrl || ""}
              placeholder="https://example.com"
              onChange={(e) => p.handleChange("externalUrl", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={Boolean(p.localProps.openInNewTab)}
              onChange={(e) => p.handleChange("openInNewTab", e.target.checked)}
            />
            Open in new tab
          </label>
        </>
      )}

      <div className="pt-2 border-t border-gray-100 space-y-3">
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={enableHoverMenu}
            onChange={(e) => p.handleChange("enableHoverMenu", e.target.checked)}
          />
          Enable hover menu
        </label>

        {enableHoverMenu ? (
          <>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Menu Layout</label>
              <select
                className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                value={hoverMenuLayout}
                onChange={(e) => p.handleChange("hoverMenuLayout", e.target.value)}
              >
                <option value="dropdown">Dropdown</option>
                <option value="mega">Mega Menu</option>
              </select>
            </div>

            {hoverMenuLayout === "mega" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Columns</label>
                  <Input
                    size="small"
                    type="number"
                    value={p.localProps.hoverMenuColumns ?? 3}
                    onChange={(e) =>
                      p.handleChange(
                        "hoverMenuColumns",
                        Math.max(1, Math.min(6, Number(e.target.value) || 1)),
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Min Width (px)</label>
                  <Input
                    size="small"
                    type="number"
                    value={p.localProps.hoverMenuMinWidth ?? 640}
                    onChange={(e) =>
                      p.handleChange("hoverMenuMinWidth", Math.max(240, Number(e.target.value) || 240))
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Menu Links</label>
                <button onClick={addHoverMenuItem} className="text-blue-500 hover:text-blue-600">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-2">
                {hoverMenuItems.length === 0 ? (
                  <p className="text-[11px] text-gray-500">Add links for hover popup menu.</p>
                ) : (
                  hoverMenuItems.map((item: any, index: number) => {
                    const itemLinkType = item.linkType || (item.externalUrl ? "external" : "internal");
                    return (
                      <div key={item.id || index} className="rounded border border-gray-200 p-2 space-y-2">
                        <div className="flex items-center gap-1">
                          <Input
                            size="small"
                            placeholder="Menu label"
                            value={item.label || ""}
                            onChange={(e) => updateHoverMenuItem(index, "label", e.target.value)}
                          />
                          <button
                            onClick={() => removeHoverMenuItem(index)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-400">Link Type</label>
                          <select
                            className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                            value={itemLinkType}
                            onChange={(e) => updateHoverMenuItem(index, "linkType", e.target.value)}
                          >
                            <option value="internal">Builder Page</option>
                            <option value="external">External URL</option>
                          </select>
                        </div>
                        {itemLinkType === "internal" ? (
                          <div className="space-y-1">
                            <label className="text-xs text-gray-400">Page</label>
                            <select
                              className="w-full text-sm border rounded p-1 bg-white border-gray-300"
                              value={item.pageSlug || ""}
                              onChange={(e) => updateHoverMenuItem(index, "pageSlug", e.target.value)}
                            >
                              <option value="">No Link</option>
                              {p.pageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs text-gray-400">External URL</label>
                              <Input
                                size="small"
                                value={item.externalUrl || ""}
                                placeholder="https://example.com"
                                onChange={(e) => updateHoverMenuItem(index, "externalUrl", e.target.value)}
                              />
                            </div>
                            <label className="flex items-center gap-2 text-xs text-gray-400">
                              <input
                                type="checkbox"
                                checked={Boolean(item.openInNewTab)}
                                onChange={(e) => updateHoverMenuItem(index, "openInNewTab", e.target.checked)}
                              />
                              Open in new tab
                            </label>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
