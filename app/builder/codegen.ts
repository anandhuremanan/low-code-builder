import { compileCustomStylesCss } from "../lib/customStyleUtils";
import { type ComponentNode, type CustomStyle, type SiteSectionKey } from "./types";

type ImportRegistry = Map<string, Set<string>>;

type GeneratorContext = {
  imports: ImportRegistry;
  helperNames: Set<string>;
  customStylesById: Map<string, CustomStyle>;
  usedCustomStyleIds: Set<string>;
};

type RawJsxValue = {
  __raw: string;
};

const INDENT = "  ";

const addImport = (registry: ImportRegistry, source: string, specifier: string) => {
  if (!registry.has(source)) {
    registry.set(source, new Set());
  }
  registry.get(source)?.add(specifier);
};

const toPascalCase = (value: string): string =>
  value
    .replace(/(^\w|[-_\s]\w)/g, (match) => match.replace(/[-_\s]/g, "").toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "");

const toComponentName = (section: SiteSectionKey): string => {
  if (section === "header") return "GeneratedHeader";
  if (section === "footer") return "GeneratedFooter";
  return `Generated${toPascalCase(section)}`;
};

const slugToComponentName = (slug: string, fallback = "GeneratedPage"): string => {
  const normalized = slug.replace(/^\/+/, "").trim();
  if (!normalized) return fallback;
  const parts = normalized.split("/").filter(Boolean).map(toPascalCase).filter(Boolean);
  return parts.length > 0 ? `${parts.join("")}Page` : fallback;
};

const toSectionTag = (section: SiteSectionKey): "header" | "footer" | "aside" => {
  if (section === "header") return "header";
  if (section === "footer") return "footer";
  return "aside";
};

const sanitizeClassName = (
  props: Record<string, any>,
  context: GeneratorContext,
): string | undefined => {
  const customStyleId = props?.customStyleId;
  if (typeof customStyleId === "string" && context.customStylesById.has(customStyleId)) {
    context.usedCustomStyleIds.add(customStyleId);
    return context.customStylesById.get(customStyleId)?.className || "";
  }
  return typeof props?.className === "string" ? props.className : undefined;
};

const INPUT_MARGIN_CLASS_REGEX = /^-?m(?:[trblxy])?-/;

const splitMarginClasses = (
  className?: string,
): { wrapperClassName: string; inputClassName: string } => {
  if (!className) return { wrapperClassName: "", inputClassName: "" };

  const tokens = className.split(/\s+/).filter(Boolean);
  const wrapperTokens = tokens.filter((token) => INPUT_MARGIN_CLASS_REGEX.test(token));
  const inputTokens = tokens.filter((token) => !INPUT_MARGIN_CLASS_REGEX.test(token));

  return {
    wrapperClassName: wrapperTokens.join(" "),
    inputClassName: inputTokens.join(" "),
  };
};

const splitMarginStyle = (
  style?: Record<string, any>,
): { wrapperStyle?: Record<string, any>; inputStyle?: Record<string, any> } => {
  if (!style) return {};

  const {
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    ...inputStyle
  } = style;

  const wrapperStyle: Record<string, any> = {};
  if (margin !== undefined) wrapperStyle.margin = margin;
  if (marginTop !== undefined) wrapperStyle.marginTop = marginTop;
  if (marginRight !== undefined) wrapperStyle.marginRight = marginRight;
  if (marginBottom !== undefined) wrapperStyle.marginBottom = marginBottom;
  if (marginLeft !== undefined) wrapperStyle.marginLeft = marginLeft;

  return {
    wrapperStyle: Object.keys(wrapperStyle).length > 0 ? wrapperStyle : undefined,
    inputStyle: Object.keys(inputStyle).length > 0 ? inputStyle : undefined,
  };
};

const formatScalar = (value: unknown): string => {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  return JSON.stringify(value);
};

const rawJsx = (value: string): RawJsxValue => ({ __raw: value });

const formatPropValue = (value: unknown): string => {
  if (value && typeof value === "object" && "__raw" in (value as Record<string, unknown>)) {
    return `{${String((value as RawJsxValue).__raw)}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  return `{${JSON.stringify(value, null, 2)
    .split("\n")
    .join(`\n${INDENT}`)}}`;
};

const formatProps = (props: Record<string, any>, context: GeneratorContext): string[] => {
  const lines: string[] = [];
  const className = sanitizeClassName(props, context);

  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "customStyleId" || value === undefined || value === "") continue;
    if (key === "className") {
      if (className) lines.push(`className=${JSON.stringify(className)}`);
      continue;
    }
    lines.push(`${key}=${formatPropValue(value)}`);
  }

  if (!("className" in props) && className) {
    lines.push(`className=${JSON.stringify(className)}`);
  }

  return lines;
};

const renderIntrinsic = (
  tagName: string,
  props: Record<string, any>,
  children: string[],
  context: GeneratorContext,
): string => {
  const propLines = formatProps(props, context);
  const childText = typeof props.children === "string" ? props.children : null;
  const allChildren = [...children];
  if (childText) allChildren.unshift(childText);

  if (allChildren.length === 0) {
    if (propLines.length === 0) return `<${tagName} />`;
    return `<${tagName}\n${INDENT}${propLines.join(`\n${INDENT}`)}\n/>`;
  }

  const openTag =
    propLines.length === 0
      ? `<${tagName}>`
      : `<${tagName}\n${INDENT}${propLines.join(`\n${INDENT}`)}\n>`;

  return `${openTag}\n${allChildren
    .map((child) =>
      child
        .split("\n")
        .map((line) => `${INDENT}${line}`)
        .join("\n"),
    )
    .join("\n")}\n</${tagName}>`;
};

const renderJsxNode = (node: ComponentNode, context: GeneratorContext): string => {
  const childJsx = node.children.map((child) => renderJsxNode(child, context));

  switch (node.type) {
    case "Container":
      addImport(context.imports, "@mui/material", "Box");
      return renderIntrinsic(
        "Box",
        { className: sanitizeClassName(node.props, context), style: node.props.style },
        childJsx,
        context,
      );
    case "Form":
      addImport(context.imports, "@mui/material", "Box");
      addImport(context.imports, "@mui/material", "Button");
      return renderIntrinsic(
        "Box",
        {
          component: "form",
          className: sanitizeClassName(node.props, context),
          style: node.props.style,
        },
        [
          renderIntrinsic("div", { className: "flex flex-col gap-3" }, [
            ...childJsx,
            ...(node.props.showSubmitButton
              ? [
                  renderIntrinsic("div", {}, [
                    renderIntrinsic(
                      "Button",
                      { type: "submit", variant: node.props.submitButtonVariant || "contained" },
                      [node.props.submitButtonText || "Submit"],
                      context,
                    ),
                  ], context),
                ]
              : []),
          ], context),
        ],
        context,
      );
    case "Text":
      addImport(context.imports, "@mui/material", "Typography");
      return renderIntrinsic(
        "Typography",
        {
          className: sanitizeClassName(node.props, context),
          style: node.props.style,
          variant: node.props.variant,
          component: node.props.component,
        },
        typeof node.props.children === "string" ? [node.props.children] : childJsx,
        context,
      );
    case "Button":
      addImport(context.imports, "@mui/material", "Button");
      addImport(context.imports, "@mui/material", "Icon");
      return renderIntrinsic(
        "Button",
        {
          className: sanitizeClassName(node.props, context),
          style: node.props.style,
          variant: node.props.variant,
          icon: node.props.icon,
          iconPos: node.props.iconPos,
        },
        typeof node.props.children === "string" ? [node.props.children] : childJsx,
        context,
      );
    case "Link":
      context.helperNames.add("GeneratedLink");
      return renderIntrinsic(
        "GeneratedLink",
        {
          className: sanitizeClassName(node.props, context),
          style: node.props.style,
          underline: node.props.underline,
          color: node.props.color,
          linkType: node.props.linkType,
          pageSlug: node.props.pageSlug,
          externalUrl: node.props.externalUrl,
          openInNewTab: node.props.openInNewTab,
          enableHoverMenu: node.props.enableHoverMenu,
          hoverMenuItems: node.props.hoverMenuItems,
          hoverMenuLayout: node.props.hoverMenuLayout,
          hoverMenuColumns: node.props.hoverMenuColumns,
          hoverMenuMinWidth: node.props.hoverMenuMinWidth,
        },
        typeof node.props.children === "string" ? [node.props.children] : childJsx,
        context,
      );
    case "Input":
      addImport(context.imports, "@mui/material", "TextField");
      {
        const resolvedClassName = sanitizeClassName(node.props, context);
        const { wrapperClassName, inputClassName } = splitMarginClasses(resolvedClassName);
        const { wrapperStyle, inputStyle } = splitMarginStyle(node.props.style);

        const inputElement = renderIntrinsic("TextField", {
          className: inputClassName || undefined,
          style: inputStyle,
          type: node.props.type,
          placeholder: node.props.placeholder,
          required: node.props.required,
          name: node.props.name,
          helperText: node.props.regexErrorMessage,
          defaultValue: node.props.value,
          variant: "outlined",
          fullWidth: true,
          sx: node.props.disableBorder
            ? {
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
              }
            : undefined,
        }, childJsx, context);

        const inputChildren = [
          ...(node.props.label
            ? [
                renderIntrinsic("label", {
                  className: "text-sm font-medium text-gray-700",
                  style: node.props.labelColor ? { color: node.props.labelColor } : undefined,
                }, [String(node.props.label)], context),
              ]
            : []),
          inputElement,
        ];

        return renderIntrinsic("div", {
          className: `flex flex-col gap-1 w-full ${wrapperClassName}`.trim(),
          style: wrapperStyle,
        }, inputChildren, context);
      }
    case "Select":
      addImport(context.imports, "@mui/material", "FormControl");
      addImport(context.imports, "@mui/material", "InputLabel");
      addImport(context.imports, "@mui/material", "MenuItem");
      addImport(context.imports, "@mui/material", "Select");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: { minWidth: 0, width: "100%", ...(node.props.style || {}) },
      }, [
        ...(node.props.caption
          ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)]
          : []),
        renderIntrinsic("FormControl", { fullWidth: true }, [
          ...(node.props.label ? [renderIntrinsic("InputLabel", {}, [String(node.props.label)], context)] : []),
          renderIntrinsic("Select", {
            label: node.props.label,
            defaultValue: node.props.value ?? node.props.options?.[0]?.value ?? "",
          }, (node.props.options || []).map((opt: { label: string; value: string | number }) =>
            renderIntrinsic("MenuItem", { key: String(opt.value), value: opt.value }, [opt.label], context)
          ), context),
        ], context),
      ], context);
    case "MultiSelect":
      context.helperNames.add("GeneratedMultiSelect");
      addImport(context.imports, "@mui/material", "Chip");
      addImport(context.imports, "@mui/material", "FormControl");
      addImport(context.imports, "@mui/material", "InputLabel");
      addImport(context.imports, "@mui/material", "MenuItem");
      addImport(context.imports, "@mui/material", "OutlinedInput");
      addImport(context.imports, "@mui/material", "Select");
      addImport(context.imports, "@mui/material", "Box");
      return renderIntrinsic("GeneratedMultiSelect", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
        caption: node.props.caption,
        label: node.props.label,
        options: node.props.options,
        initialValue: node.props.value,
      }, childJsx, context);
    case "RadioGroup":
      addImport(context.imports, "@mui/material", "FormControl");
      addImport(context.imports, "@mui/material", "FormControlLabel");
      addImport(context.imports, "@mui/material", "FormLabel");
      addImport(context.imports, "@mui/material", "Radio");
      addImport(context.imports, "@mui/material", "RadioGroup");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: { minWidth: 0, width: "100%", ...(node.props.style || {}) },
      }, [
        ...(node.props.caption
          ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)]
          : []),
          renderIntrinsic("FormControl", { sx: { width: "100%", minWidth: 0 } }, [
          ...(node.props.label ? [renderIntrinsic("FormLabel", {}, [String(node.props.label)], context)] : []),
          renderIntrinsic("RadioGroup", {
            row: Boolean(node.props.row),
            defaultValue: node.props.value ?? "",
          }, (node.props.options || []).map((opt: { label: string; value: string | number }) =>
            renderIntrinsic("FormControlLabel", { key: String(opt.value), value: opt.value, control: rawJsx("<Radio />"), label: opt.label }, [], context)
          ), context),
        ], context),
      ], context);
    case "Rating":
      addImport(context.imports, "@mui/material", "FormControl");
      addImport(context.imports, "@mui/material", "FormLabel");
      addImport(context.imports, "@mui/material", "Rating");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: { minWidth: 0, width: "100%", ...(node.props.style || {}) },
      }, [
        ...(node.props.caption
          ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)]
          : []),
        renderIntrinsic("FormControl", { sx: { width: "100%", minWidth: 0 } }, [
          ...(node.props.label ? [renderIntrinsic("FormLabel", {}, [String(node.props.label)], context)] : []),
          renderIntrinsic("Rating", {
            defaultValue: node.props.value ?? 0,
            max: node.props.max ?? 5,
            precision: node.props.precision ?? 1,
            readOnly: Boolean(node.props.readOnly),
            size: node.props.size ?? "medium",
          }, [], context),
        ], context),
      ], context);
    case "Checkbox":
      addImport(context.imports, "@mui/material", "Checkbox");
      addImport(context.imports, "@mui/material", "FormControlLabel");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: { minWidth: 0, width: "100%", ...(node.props.style || {}) },
      }, [
        ...(node.props.caption
          ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)]
          : []),
        renderIntrinsic("FormControlLabel", {
          sx: { width: "100%", minWidth: 0, display: "flex", margin: 0 },
          control: rawJsx(`<Checkbox defaultChecked={${String(Boolean(node.props.checked))}} />`),
          label: node.props.label || "",
        }, [], context),
      ], context);
    case "Switch":
      addImport(context.imports, "@mui/material", "FormControlLabel");
      addImport(context.imports, "@mui/material", "Switch");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: { minWidth: 0, width: "100%", ...(node.props.style || {}) },
      }, [
        ...(node.props.caption
          ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)]
          : []),
        renderIntrinsic("FormControlLabel", {
          sx: { width: "100%", minWidth: 0, display: "flex", margin: 0 },
          control: rawJsx(`<Switch defaultChecked={${String(Boolean(node.props.checked))}} size=${JSON.stringify(node.props.size || "medium")} />`),
          label: node.props.label || "",
        }, [], context),
      ], context);
    case "Image":
      return renderIntrinsic("img", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
        src: node.props.src || "https://placehold.co/300x180",
        alt: node.props.alt || "image",
      }, childJsx, context);
    case "Textarea":
      return renderIntrinsic("textarea", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
        placeholder: node.props.placeholder,
        defaultValue: node.props.value,
      }, childJsx, context);
    case "DataGrid":
      context.helperNames.add("GeneratedDataGrid");
      return renderIntrinsic("GeneratedDataGrid", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
        apiUrl: node.props.apiUrl,
        columns: node.props.columns,
        dummyData: node.props.dummyData,
      }, childJsx, context);
    case "Charts":
      context.helperNames.add("GeneratedChart");
      addImport(context.imports, "@mui/x-charts", "BarChart");
      addImport(context.imports, "@mui/x-charts", "LineChart");
      addImport(context.imports, "@mui/x-charts", "PieChart");
      return renderIntrinsic("GeneratedChart", {
        ...node.props,
        className: sanitizeClassName(node.props, context),
      }, childJsx, context);
    case "MaterialIcon":
      addImport(context.imports, "@mui/material", "Icon");
      return renderIntrinsic("Icon", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
      }, [String(node.props.icon || "home")], context);
    case "DatePicker":
      addImport(context.imports, "@mui/material", "TextField");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
      }, [
        ...(node.props.caption ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)] : []),
        renderIntrinsic("TextField", { fullWidth: true, label: node.props.label || "Select Date", helperText: node.props.helperText, type: "date", InputLabelProps: { shrink: true } }, [], context),
      ], context);
    case "TimePicker":
      addImport(context.imports, "@mui/material", "TextField");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
      }, [
        ...(node.props.caption ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)] : []),
        renderIntrinsic("TextField", { fullWidth: true, label: node.props.label || "Select Time", helperText: node.props.helperText, type: "time", InputLabelProps: { shrink: true } }, [], context),
      ], context);
    case "DateTimePicker":
      addImport(context.imports, "@mui/material", "TextField");
      return renderIntrinsic("div", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
      }, [
        ...(node.props.caption ? [renderIntrinsic("div", { className: "mb-1 text-sm font-medium text-gray-700" }, [String(node.props.caption)], context)] : []),
        renderIntrinsic("TextField", { fullWidth: true, label: node.props.label || "Select Date & Time", helperText: node.props.helperText, type: "datetime-local", InputLabelProps: { shrink: true } }, [], context),
      ], context);
    case "Tabs":
      context.helperNames.add("GeneratedTabs");
      return renderIntrinsic("GeneratedTabs", {
        className: sanitizeClassName(node.props, context),
        style: node.props.style,
        items: node.props.items,
        defaultValue: node.props.defaultValue,
      }, childJsx, context);
    case "Stepper":
      context.helperNames.add("GeneratedStepper");
      addImport(context.imports, "@mui/material", "Button");
      addImport(context.imports, "@mui/material", "Box");
      addImport(context.imports, "@mui/material", "Step");
      addImport(context.imports, "@mui/material", "StepLabel");
      addImport(context.imports, "@mui/material", "Stepper");
      addImport(context.imports, "@mui/material", "Typography");
      return renderIntrinsic("GeneratedStepper", {
        ...node.props,
        className: sanitizeClassName(node.props, context),
      }, childJsx, context);
    default:
      return `{/* Unsupported node: ${node.type} */}`;
  }
};

const buildImportBlock = (registry: ImportRegistry): string => {
  const lines = Array.from(registry.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, specifiers]) => {
      const named = Array.from(specifiers).sort().join(", ");
      return `import { ${named} } from "${source}";`;
    });

  return lines.join("\n");
};

const buildGeneratedTabsHelper = (): string => {
  return `
const GeneratedTabs = ({
  items = [],
  defaultValue = 0,
  className,
  style,
  children,
}: {
  items?: Array<{ id?: string; label?: string }>;
  defaultValue?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => {
  const safeIndex = Math.min(Math.max(defaultValue, 0), Math.max(items.length - 1, 0));
  const [activeIndex, setActiveIndex] = React.useState(safeIndex);
  const panels = React.Children.toArray(children);

  return (
    <div className={className} style={style}>
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <button
              key={item.id || String(index)}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={\`px-4 py-2 text-sm border-b-2 transition-colors \${activeIndex === index ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-gray-600 hover:text-gray-900"}\`}
            >
              {item.label || \`Tab \${index + 1}\`}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4">{panels[activeIndex] || null}</div>
    </div>
  );
};
`.trim();
};

const buildGeneratedLinkHelper = (): string => {
  return `
const GeneratedLink = ({
  children,
  className,
  style,
  linkType = "internal",
  pageSlug = "/",
  externalUrl = "",
  openInNewTab = false,
  enableHoverMenu = false,
  hoverMenuItems = [],
  hoverMenuLayout = "dropdown",
  hoverMenuColumns = 3,
  hoverMenuMinWidth = 640,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  linkType?: "internal" | "external";
  pageSlug?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
  enableHoverMenu?: boolean;
  hoverMenuItems?: Array<{ id?: string; label?: string; linkType?: "internal" | "external"; pageSlug?: string; externalUrl?: string; openInNewTab?: boolean }>;
  hoverMenuLayout?: "dropdown" | "mega";
  hoverMenuColumns?: number;
  hoverMenuMinWidth?: number;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const href = linkType === "external" ? externalUrl || "#" : pageSlug || "#";
  const hasHoverItems = enableHoverMenu && hoverMenuItems.length > 0;

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <a
        className={className}
        style={style}
        href={hasHoverItems ? undefined : href}
        target={linkType === "external" && openInNewTab ? "_blank" : undefined}
        rel={linkType === "external" && openInNewTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
      {hasHoverItems && isOpen ? (
        <div
          className="absolute left-0 top-full z-30 rounded-md border border-gray-200 bg-white p-2 shadow-lg"
          style={hoverMenuLayout === "mega" ? { minWidth: \`\${Math.max(240, Number(hoverMenuMinWidth) || 640)}px\` } : undefined}
        >
          <div
            className={hoverMenuLayout === "mega" ? "grid gap-1" : "flex flex-col gap-1"}
            style={hoverMenuLayout === "mega" ? { gridTemplateColumns: \`repeat(\${Math.max(1, Math.min(6, Number(hoverMenuColumns) || 3))}, minmax(0, 1fr))\` } : undefined}
          >
            {hoverMenuItems.map((item, index) => {
              const itemType = item.linkType || (item.externalUrl ? "external" : "internal");
              const itemHref = itemType === "external" ? item.externalUrl || "#" : item.pageSlug || "#";
              return (
                <a
                  key={item.id || index}
                  href={itemHref}
                  target={itemType === "external" && item.openInNewTab ? "_blank" : undefined}
                  rel={itemType === "external" && item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.label || \`Menu Link \${index + 1}\`}
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
`.trim();
};

const buildGeneratedMultiSelectHelper = (): string => {
  return `
const GeneratedMultiSelect = ({
  caption,
  label,
  options = [],
  initialValue = [],
  className,
  style,
}: {
  caption?: string;
  label?: string;
  options?: Array<{ label: string; value: string | number }>;
  initialValue?: Array<string | number>;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [value, setValue] = React.useState<Array<string | number>>(initialValue);

  return (
    <div className={className} style={{ minWidth: 0, width: "100%", ...(style || {}) }}>
      {caption ? <div className="mb-1 text-sm font-medium text-gray-700">{caption}</div> : null}
      <FormControl fullWidth>
        {label ? <InputLabel>{label}</InputLabel> : null}
        <Select
          multiple
          value={value}
          onChange={(event) => {
            const nextValue = typeof event.target.value === "string" ? event.target.value.split(",") : (event.target.value as Array<string | number>);
            setValue(nextValue);
          }}
          input={<OutlinedInput label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as Array<string | number>).map((selectedValue) => {
                const option = options.find((item) => item.value === selectedValue);
                return <Chip key={String(selectedValue)} label={option?.label || selectedValue} />;
              })}
            </Box>
          )}
        >
          {options.map((option) => (
            <MenuItem key={String(option.value)} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
`.trim();
};

const buildGeneratedDataGridHelper = (): string => {
  return `
const GeneratedDataGrid = ({
  className,
  style,
  columns = [],
  dummyData = [],
}: {
  className?: string;
  style?: React.CSSProperties;
  columns?: Array<{ field: string; headerName?: string; width?: number }>;
  dummyData?: Array<Record<string, unknown>>;
}) => {
  const fallbackRows = dummyData.length > 0 ? dummyData : [
    { id: 1, firstName: "Jon", lastName: "Snow", age: 35 },
    { id: 2, firstName: "Arya", lastName: "Stark", age: 16 },
  ];
  const fallbackColumns = columns.length > 0 ? columns : Object.keys(fallbackRows[0] || {}).map((field) => ({ field, headerName: field }));

  return (
    <div className={className} style={{ width: "100%", overflowX: "auto", ...(style || {}) }}>
      <table className="min-w-full border border-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {fallbackColumns.map((column) => (
              <th key={column.field} className="border border-slate-200 px-3 py-2 text-left font-medium">
                {column.headerName || column.field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fallbackRows.map((row, index) => (
            <tr key={String((row as { id?: string | number }).id || index)}>
              {fallbackColumns.map((column) => (
                <td key={column.field} className="border border-slate-200 px-3 py-2">
                  {String(row[column.field] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
`.trim();
};

const buildGeneratedChartHelper = (): string => {
  return `
const GeneratedChart = ({
  chartType = "bar",
  title,
  labels = [],
  values = [],
  height = 320,
  color = "#1976d2",
  pointColors = [],
  className,
}: {
  chartType?: "bar" | "line" | "pie";
  title?: string;
  labels?: string[];
  values?: number[];
  height?: number;
  color?: string;
  pointColors?: string[];
  className?: string;
}) => {
  const seriesData = values.map((value, index) => ({
    id: index,
    value,
    label: labels[index] || \`Item \${index + 1}\`,
    color: pointColors[index] || color,
  }));

  return (
    <div className={className}>
      {title ? <div className="mb-2 text-base font-semibold text-slate-900">{title}</div> : null}
      {chartType === "line" ? (
        <LineChart height={height} xAxis={[{ scaleType: "point", data: labels }]} series={[{ data: values, color }]} />
      ) : chartType === "pie" ? (
        <PieChart height={height} series={[{ data: seriesData }]} />
      ) : (
        <BarChart height={height} xAxis={[{ scaleType: "band", data: labels }]} series={[{ data: values, color }]} />
      )}
    </div>
  );
};
`.trim();
};

const buildGeneratedStepperHelper = (): string => {
  return `
const GeneratedStepper = ({
  steps = [],
  activeStep = 0,
  orientation = "horizontal",
  linear = true,
  alternativeLabel = true,
  showControls = true,
  showStatusText = true,
  stepPrefixText = "Step",
  completedText = "All steps completed - you're finished",
  backLabel = "Back",
  nextLabel = "Next",
  skipLabel = "Skip",
  finishLabel = "Finish",
  resetLabel = "Reset",
  className,
  style,
  children,
}: {
  steps?: Array<{ label: string; optional?: boolean }>;
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  linear?: boolean;
  alternativeLabel?: boolean;
  showControls?: boolean;
  showStatusText?: boolean;
  stepPrefixText?: string;
  completedText?: string;
  backLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  finishLabel?: string;
  resetLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => {
  const safeSteps = steps.length > 0 ? steps : [{ label: "Step 1" }, { label: "Step 2" }];
  const [currentStep, setCurrentStep] = React.useState(Math.max(0, Math.min(activeStep, safeSteps.length)));
  const panels = React.Children.toArray(children);
  const completedAll = currentStep >= safeSteps.length;

  return (
    <Box className={className} style={style}>
      <Stepper activeStep={currentStep} orientation={orientation} alternativeLabel={orientation === "horizontal" ? alternativeLabel : false} nonLinear={!linear}>
        {safeSteps.map((step, index) => (
          <Step key={\`\${step.label}-\${index}\`}>
            <StepLabel optional={step.optional ? <Typography variant="caption">Optional</Typography> : undefined}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {showStatusText ? (
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {completedAll ? completedText : \`\${stepPrefixText} \${Math.min(currentStep + 1, safeSteps.length)}\`}
          </Typography>
        </Box>
      ) : null}
      {!completedAll ? <Box sx={{ pt: 2 }}>{panels[currentStep] || null}</Box> : null}
      {showControls ? (
        <Box sx={{ display: "flex", flexDirection: "column", pt: 2, gap: 2 }}>
          {completedAll ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => setCurrentStep(0)}>{resetLabel}</Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button color="inherit" disabled={currentStep === 0} onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} sx={{ mr: 1 }}>
                {backLabel}
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {safeSteps[currentStep]?.optional ? (
                <Button color="inherit" onClick={() => setCurrentStep((prev) => prev + 1)} sx={{ mr: 1 }}>
                  {skipLabel}
                </Button>
              ) : null}
              <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
                {currentStep === safeSteps.length - 1 ? finishLabel : nextLabel}
              </Button>
            </Box>
          )}
        </Box>
      ) : null}
    </Box>
  );
};
`.trim();
};

const indentBlock = (value: string, depth = 1): string => {
  const prefix = INDENT.repeat(depth);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
};

const generateComponentCode = ({
  componentName,
  wrapperTag,
  nodes,
  customStyles,
}: {
  componentName: string;
  wrapperTag: "header" | "footer" | "aside" | "section";
  nodes: ComponentNode[];
  customStyles: CustomStyle[];
}): string => {
  const context: GeneratorContext = {
    imports: new Map(),
    helperNames: new Set(),
    customStylesById: new Map(customStyles.map((style) => [style.id, style])),
    usedCustomStyleIds: new Set(),
  };

  const body = nodes.map((node) => renderJsxNode(node, context)).join("\n");
  const css = compileCustomStylesCss(
    customStyles.filter((style) => context.usedCustomStyleIds.has(style.id)),
  );

  const importBlock = buildImportBlock(context.imports);
  const helperParts: string[] = [];
  if (context.helperNames.has("GeneratedLink")) helperParts.push(buildGeneratedLinkHelper());
  if (context.helperNames.has("GeneratedMultiSelect")) helperParts.push(buildGeneratedMultiSelectHelper());
  if (context.helperNames.has("GeneratedDataGrid")) helperParts.push(buildGeneratedDataGridHelper());
  if (context.helperNames.has("GeneratedChart")) helperParts.push(buildGeneratedChartHelper());
  if (context.helperNames.has("GeneratedTabs")) helperParts.push(buildGeneratedTabsHelper());
  if (context.helperNames.has("GeneratedStepper")) helperParts.push(buildGeneratedStepperHelper());
  const helperBlock = helperParts.length > 0 ? `\n\n${helperParts.join("\n\n")}` : "";
  const cssBlock = css
    ? `\n\nconst generatedStyles = ${formatScalar(css)};\n`
    : "";

  return `import React from "react";
${importBlock ? `${importBlock}\n` : ""}
${helperBlock}${cssBlock}
export default function ${componentName}() {
  return (
    <>
${css ? `      <style>{generatedStyles}</style>\n` : ""}      <${wrapperTag}>
${indentBlock(body, 4)}
      </${wrapperTag}>
    </>
  );
}
`;
};

export const generateSectionComponentCode = ({
  section,
  nodes,
  customStyles,
}: {
  section: SiteSectionKey;
  nodes: ComponentNode[];
  customStyles: CustomStyle[];
}): string =>
  generateComponentCode({
    componentName: toComponentName(section),
    wrapperTag: toSectionTag(section),
    nodes,
    customStyles,
  });

export const generatePageComponentCode = ({
  pageName,
  pageSlug,
  nodes,
  customStyles,
}: {
  pageName?: string;
  pageSlug?: string;
  nodes: ComponentNode[];
  customStyles: CustomStyle[];
}): { code: string; componentName: string; fileName: string } => {
  const componentName = slugToComponentName(pageSlug || "", toPascalCase(pageName || "") || "GeneratedPage");
  const code = generateComponentCode({
    componentName,
    wrapperTag: "section",
    nodes,
    customStyles,
  });

  return {
    code,
    componentName,
    fileName: `${componentName}.tsx`,
  };
};
