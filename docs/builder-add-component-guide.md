# Builder Guide: Add a New Drag-and-Drop Component

This guide explains how to add a new component so it appears in the builder sidebar, can be dragged onto the canvas, and can be configured in the properties panel.

## 1. Create or choose the render component

Use an existing UI component from `app/components/ui/*` or add a new builder-specific component under `app/builder/components/*`.

Example target files:
- `app/components/ui/YourComponent.tsx`
- `app/builder/components/YourComponent.tsx`

## 2. Add the component type

Update `app/builder/types.ts`:

1. Add the new literal to `ComponentType`.

```ts
export type ComponentType =
  | "Container"
  | "Header"
  | "Footer"
  | "Button"
  | "Input"
  | "YourComponent";
```

This enables type-safe registration and drag metadata across the builder.

## 3. Register it in the component registry

Update `app/builder/registry.tsx`:

1. Import an icon from `lucide-react`.
2. Import your component implementation.
3. Add a `COMPONENT_REGISTRY` entry with `name`, `icon`, `component`, and `defaultProps`.

```tsx
import { Sparkles as YourComponentIcon } from "lucide-react";
import { YourComponent } from "../components/ui/YourComponent";

YourComponent: {
  name: "Your Component",
  icon: YourComponentIcon,
  component: YourComponent,
  defaultProps: {
    label: "New component",
    className: "",
  },
},
```

Notes:
- `defaultProps` are cloned on drop in `app/builder/components/BuilderLayout.tsx`.
- Keep defaults JSON-safe (avoid functions and non-serializable values).

## 4. Ensure the component can render in the canvas

No extra canvas wiring is usually needed. `app/builder/components/Canvas.tsx` renders every node by looking up `COMPONENT_REGISTRY[node.type]`.

Things to verify:
- Your component accepts props defined in `defaultProps`.
- If it should contain child nodes, render `{children}` and add a container strategy (see step 7).

## 5. Confirm it appears in the sidebar and can be dragged

No extra sidebar wiring is usually needed. `app/builder/components/Sidebar.tsx` iterates over `Object.keys(COMPONENT_REGISTRY)`.

After registration, your component should automatically show in the Components tab.

## 6. Add editable fields in Properties Panel (optional but recommended)

Update `app/builder/components/PropertiesPanel.tsx` to expose controls for component-specific props.

Pattern:
- Add a conditional block: `selectedNode.type === "YourComponent"`.
- Bind controls to `localProps`.
- Use `handleChange("propName", value)` or style helpers.

```tsx
{selectedNode.type === 'YourComponent' && (
  <div className="space-y-3">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Component</label>
    <div className="space-y-1">
      <label className="text-xs text-gray-400">Label</label>
      <Input
        size="small"
        value={localProps.label || ''}
        onChange={(e) => handleChange('label', e.target.value)}
      />
    </div>
  </div>
)}
```

## 7. If the new component is a container, add drop support

The current canvas marks only `Container` nodes as droppable.

Update the container check in `app/builder/components/Canvas.tsx`:

```ts
const isContainer = node.type === 'Container' || node.type === 'YourComponent';
```

This allows dropping children inside your new component.

## 8. Handle special placement rules (only if needed)

`app/builder/components/BuilderLayout.tsx` contains custom placement logic (example: `Footer` is forced under `root-container`).

If your component needs custom behavior on drop, extend that logic in `handleDragEnd`.

## 9. Test manually

Run:

```bash
npm run dev
```

Then verify:
1. Component is visible in sidebar.
2. Drag from sidebar to canvas works.
3. Component renders with default props.
4. Selecting component opens expected controls in Properties Panel.
5. Prop edits update the node live.
6. Moving/reparenting behaves correctly.

## 10. Common pitfalls

- Missing `ComponentType` union update causes type errors.
- Missing registry entry means nothing renders.
- Non-serializable `defaultProps` can break cloning during drop.
- Container-like components will not accept children unless included in droppable check.
- If props are editable but not wired in `PropertiesPanel`, they cannot be changed in the UI.

## Quick Checklist

- [ ] Added component file
- [ ] Added `ComponentType` literal in `app/builder/types.ts`
- [ ] Added registry entry in `app/builder/registry.tsx`
- [ ] Added properties UI in `app/builder/components/PropertiesPanel.tsx` (if needed)
- [ ] Added droppable container support in `app/builder/components/Canvas.tsx` (if container)
- [ ] Tested drag/drop + edit flow in browser
