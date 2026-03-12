import React from "react";
import { Input } from "../../../components/ui/Input";
import type { NodeProperties } from "./useNodeProperties";

export const FormSettings = ({ p }: { p: NodeProperties }) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Form Settings
      </label>
      <label className="flex items-center gap-2 text-xs text-gray-400">
        <input
          type="checkbox"
          checked={Boolean(p.localProps.showSubmitButton)}
          onChange={(e) => p.handleChange("showSubmitButton", e.target.checked)}
        />
        Show Submit Button
      </label>
      <div className="space-y-1">
        <label className="text-xs text-gray-400">Submit Button Text</label>
        <Input
          size="small"
          value={p.localProps.submitButtonText || ""}
          onChange={(e) => p.handleChange("submitButtonText", e.target.value)}
          placeholder="Submit"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-400">Submit Button Variant</label>
        <select
          className="w-full text-sm border rounded p-1 bg-white border-gray-300"
          value={p.localProps.submitButtonVariant || "contained"}
          onChange={(e) => p.handleChange("submitButtonVariant", e.target.value)}
        >
          <option value="contained">Contained</option>
          <option value="outlined">Outlined</option>
          <option value="text">Text</option>
        </select>
      </div>
    </div>
  );
};
