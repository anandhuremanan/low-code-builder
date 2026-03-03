import React from "react";
import { Input } from "../../../components/ui/Input";
import type { NodeProperties } from "./useNodeProperties";

export const LinkSettings = ({ p }: { p: NodeProperties }) => {
  const linkType = p.localProps.linkType || "internal";

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
    </div>
  );
};
