import React, { useEffect, useMemo, useState } from "react";
import { useLoaderData, useLocation } from "react-router";
import { Box } from "../components/ui/Box";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { MultiSelect } from "../components/ui/MultiSelect";
import { RadioGroup } from "../components/ui/RadioGroup";
import { Rating } from "../components/ui/Rating";
import { Switch } from "../components/ui/Switch";
import { Checkbox } from "../components/ui/Checkbox";
import { Typography } from "../components/ui/Typography";
import { Dialog as MuiDialog, DialogContent, DialogTitle } from "@mui/material";
import {
  type ComponentNode,
  type CustomStyle,
  type Page,
  type Popup,
  type SiteSections,
} from "../builder/types";
import { DataGrid } from "../builder/components/DataGrid";
import { Charts } from "../builder/components/Charts";
import { MaterialIcon } from "../builder/components/MaterialIcon";
import { DatePicker } from "../builder/components/DatePicker";
import { Stepper } from "../builder/components/Stepper";
import { TimePicker } from "../builder/components/TimePicker";
import { DateTimePicker } from "../builder/components/DateTimePicker";
import { compileCustomStylesCss } from "../lib/customStyleUtils";
import { LinkNode } from "../builder/components/LinkNode";
import {
  type BuilderPreviewSnapshot,
  loadPreviewSnapshot,
} from "../features/builder/persistence/storage";
type SiteSnapshot = BuilderPreviewSnapshot;

export async function clientLoader() {
  return loadPreviewSnapshot();
}

Object.assign(clientLoader, { hydrate: true as const });

type TabItem = {
  id: string;
  label: string;
};

type ValidationReason = "onKeydown" | "onBlur" | "onInput" | "onSubmit";

type FormContextValue = {
  registerFieldValidator: (
    fieldId: string,
    validator: (reason: ValidationReason) => boolean,
  ) => void;
  unregisterFieldValidator: (fieldId: string) => void;
};

const PreviewFormContext = React.createContext<FormContextValue | null>(null);

const sanitizePreviewContainerClassName = (className?: string): string => {
  if (!className) return "";
  const tokens = className.split(/\s+/).filter(Boolean);
  const hasDashedBorder = tokens.includes("border-dashed");

  return tokens
    .filter((token) => token !== "border-dashed")
    .filter((token) => !/^border-gray-\d+$/.test(token))
    .filter((token) => !(hasDashedBorder && token === "border"))
    .join(" ");
};

const hasWidthClass = (className?: string): boolean => {
  if (!className) return false;
  return className.split(/\s+/).some((token) => /^w-/.test(token));
};

const withDefaultWidthStyle = (
  style: React.CSSProperties | undefined,
  className?: string,
): React.CSSProperties => {
  const nextStyle = { ...(style || {}) };
  if (nextStyle.width || hasWidthClass(className)) return nextStyle;
  return { ...nextStyle, width: "100%" };
};

const INPUT_MARGIN_CLASS_REGEX = /^-?m(?:[trblxy])?-/;

const splitMarginClasses = (
  className?: string,
): { wrapperClassName: string; inputClassName: string } => {
  if (!className) return { wrapperClassName: "", inputClassName: "" };

  const tokens = className.split(/\s+/).filter(Boolean);
  const wrapperTokens = tokens.filter((token) =>
    INPUT_MARGIN_CLASS_REGEX.test(token),
  );
  const inputTokens = tokens.filter(
    (token) => !INPUT_MARGIN_CLASS_REGEX.test(token),
  );

  return {
    wrapperClassName: wrapperTokens.join(" "),
    inputClassName: inputTokens.join(" "),
  };
};

const splitMarginStyle = (
  style?: React.CSSProperties,
): { wrapperStyle?: React.CSSProperties; inputStyle?: React.CSSProperties } => {
  if (!style) return {};

  const {
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    ...inputStyle
  } = style;

  const wrapperStyle: React.CSSProperties = {};
  if (margin !== undefined) wrapperStyle.margin = margin;
  if (marginTop !== undefined) wrapperStyle.marginTop = marginTop;
  if (marginRight !== undefined) wrapperStyle.marginRight = marginRight;
  if (marginBottom !== undefined) wrapperStyle.marginBottom = marginBottom;
  if (marginLeft !== undefined) wrapperStyle.marginLeft = marginLeft;

  return {
    wrapperStyle: Object.keys(wrapperStyle).length ? wrapperStyle : undefined,
    inputStyle: Object.keys(inputStyle).length ? inputStyle : undefined,
  };
};

const PreviewTabs = ({
  items,
  children,
  className,
  style,
  defaultValue = 0,
}: {
  items: TabItem[];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: number;
}) => {
  const safeDefaultIndex = Math.min(
    Math.max(defaultValue, 0),
    Math.max(items.length - 1, 0),
  );
  const [activeIndex, setActiveIndex] = useState(safeDefaultIndex);
  const currentChildren = React.Children.toArray(children);
  const activePanel = currentChildren[activeIndex] || null;

  return (
    <div className={className} style={style}>
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <button
              key={item.id || String(index)}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                activeIndex === index
                  ? "border-blue-600 text-blue-700 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4">{activePanel}</div>
    </div>
  );
};

const PreviewRadioGroupField = ({
  className,
  style,
  caption,
  label,
  options,
  value,
  row,
}: {
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  value?: string | number;
  row?: boolean;
}) => {
  const initialValue = value ?? options?.[0]?.value ?? "";
  const [selectedValue, setSelectedValue] = useState<string | number>(
    initialValue,
  );

  useEffect(() => {
    setSelectedValue(value ?? options?.[0]?.value ?? "");
  }, [value, options]);

  return (
    <RadioGroup
      className={className}
      style={style}
      caption={caption}
      label={label}
      options={options || []}
      value={selectedValue}
      row={Boolean(row)}
      onChange={(nextValue) => setSelectedValue(nextValue)}
    />
  );
};

const PreviewRatingField = ({
  className,
  style,
  caption,
  label,
  value,
  max,
  precision,
  readOnly,
  size,
}: {
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  label?: string;
  value?: number | null;
  max?: number;
  precision?: number;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
}) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(value ?? 0);

  useEffect(() => {
    setSelectedValue(value ?? 0);
  }, [value]);

  return (
    <Rating
      className={className}
      style={style}
      caption={caption}
      label={label}
      value={selectedValue}
      max={max ?? 5}
      precision={precision ?? 1}
      readOnly={Boolean(readOnly)}
      size={size ?? "medium"}
      onChange={(nextValue) => setSelectedValue(nextValue)}
    />
  );
};

const PreviewSwitchField = ({
  className,
  style,
  caption,
  label,
  checked,
  size,
}: {
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  label?: string;
  checked?: boolean;
  size?: "small" | "medium";
}) => {
  const [isChecked, setIsChecked] = useState(Boolean(checked));

  useEffect(() => {
    setIsChecked(Boolean(checked));
  }, [checked]);

  return (
    <Switch
      className={className}
      style={style}
      caption={caption}
      label={label}
      size={size || "medium"}
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
    />
  );
};

const PreviewCheckboxField = ({
  className,
  style,
  caption,
  label,
  checked,
}: {
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  label?: string;
  checked?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(Boolean(checked));

  useEffect(() => {
    setIsChecked(Boolean(checked));
  }, [checked]);

  return (
    <Checkbox
      className={className}
      style={style}
      caption={caption}
      label={label}
      fullWidth
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
    />
  );
};

const resolveNodeClassName = (
  props: Record<string, any>,
  customStyleById: Map<string, CustomStyle>,
): string => {
  const customStyleId = props?.customStyleId;
  if (typeof customStyleId === "string" && customStyleById.has(customStyleId)) {
    return customStyleById.get(customStyleId)?.className || "";
  }
  return props?.className || "";
};

const PreviewInputField = ({
  node,
  inputClassName,
  inputStyle,
}: {
  node: ComponentNode;
  inputClassName: string;
  inputStyle?: React.CSSProperties;
}) => {
  const formContext = React.useContext(PreviewFormContext);
  const [value, setValue] = useState(String(node.props.value ?? ""));
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const required = Boolean(node.props.required);
  const regexPattern = String(node.props.regexPattern || "").trim();
  const regexErrorMessage = String(node.props.regexErrorMessage || "").trim();
  const regexValidationTrigger = (node.props.regexValidationTrigger ||
    "onSubmit") as ValidationReason;

  useEffect(() => {
    setValue(String(node.props.value ?? ""));
  }, [node.props.value, node.id]);

  const validateValue = React.useCallback(
    (reason: ValidationReason, candidateValue: string) => {
      const normalizedValue = candidateValue.trim();

      if (required && !normalizedValue) {
        setErrorText("This field is required.");
        return false;
      }

      if (!regexPattern) {
        setErrorText(undefined);
        return true;
      }

      let regex: RegExp;
      try {
        regex = new RegExp(regexPattern);
      } catch {
        setErrorText("Invalid regex pattern.");
        return false;
      }

      const shouldEvaluateRegex =
        reason === "onSubmit" || regexValidationTrigger === reason;
      if (!shouldEvaluateRegex) {
        if (!required || normalizedValue) {
          setErrorText(undefined);
        }
        return true;
      }

      if (!regex.test(candidateValue)) {
        setErrorText(
          regexErrorMessage || "Input does not match the regex pattern.",
        );
        return false;
      }

      setErrorText(undefined);
      return true;
    },
    [regexPattern, regexValidationTrigger, required],
  );

  useEffect(() => {
    if (!formContext) return;
    const validator = (reason: ValidationReason) => validateValue(reason, value);
    formContext.registerFieldValidator(node.id, validator);
    return () => {
      formContext.unregisterFieldValidator(node.id);
    };
  }, [formContext, node.id, validateValue, value]);

  return (
    <Input
      className={inputClassName}
      style={inputStyle}
      placeholder={node.props.placeholder}
      size={node.props.size}
      type={node.props.type || "text"}
      disableBorder={Boolean(node.props.disableBorder)}
      value={value}
      name={node.props.name || undefined}
      required={required}
      error={Boolean(errorText)}
      helperText={errorText}
      onChange={(event) => {
        const nextValue = event.target.value;
        setValue(nextValue);
        if (regexValidationTrigger === "onInput") {
          validateValue("onInput", nextValue);
        }
      }}
      onBlur={(event) => {
        const input = event.target as HTMLInputElement;
        validateValue("onBlur", input.value);
      }}
      onKeyDown={(event) => {
        if (regexValidationTrigger === "onKeydown") {
          const input = event.target as HTMLInputElement;
          window.requestAnimationFrame(() => {
            validateValue("onKeydown", input.value);
          });
        }
      }}
    />
  );
};

const PreviewFormNode = ({
  node,
  resolvedClassName,
  resolvedStyle,
  children,
}: {
  node: ComponentNode;
  resolvedClassName: string;
  resolvedStyle: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const validatorMapRef = React.useRef<
    Map<string, (reason: ValidationReason) => boolean>
  >(new Map());

  const registerFieldValidator = React.useCallback(
    (fieldId: string, validator: (reason: ValidationReason) => boolean) => {
      validatorMapRef.current.set(fieldId, validator);
    },
    [],
  );

  const unregisterFieldValidator = React.useCallback((fieldId: string) => {
    validatorMapRef.current.delete(fieldId);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validators = Array.from(validatorMapRef.current.values());
    for (const validate of validators) {
      const valid = validate("onSubmit");
      if (!valid) return;
    }
  };

  const contextValue: FormContextValue = {
    registerFieldValidator,
    unregisterFieldValidator,
  };

  return (
    <PreviewFormContext.Provider value={contextValue}>
      <Box
        component="form"
        className={sanitizePreviewContainerClassName(resolvedClassName)}
        style={resolvedStyle}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3">
          {children}
          {node.props.showSubmitButton ? (
            <div>
              <Button
                type="submit"
                variant={node.props.submitButtonVariant || "contained"}
              >
                {node.props.submitButtonText || "Submit"}
              </Button>
            </div>
          ) : null}
        </div>
      </Box>
    </PreviewFormContext.Provider>
  );
};

const PreviewNode = ({
  node,
  customStyleById,
  onOpenPopup,
}: {
  node: ComponentNode;
  customStyleById: Map<string, CustomStyle>;
  onOpenPopup: (popupId: string) => void;
}) => {
  const childNodes = node.children.map((child) => (
    <PreviewNode
      key={child.id}
      node={child}
      customStyleById={customStyleById}
      onOpenPopup={onOpenPopup}
    />
  ));
  const resolvedClassName = resolveNodeClassName(node.props, customStyleById);
  const resolvedStyle = withDefaultWidthStyle(
    node.props.style,
    resolvedClassName,
  );

  switch (node.type) {
    case "Container":
      return (
        <Box
          className={sanitizePreviewContainerClassName(resolvedClassName)}
          style={resolvedStyle}
        >
          {childNodes}
        </Box>
      );
    case "Form":
      return (
        <PreviewFormNode
          node={node}
          resolvedClassName={resolvedClassName}
          resolvedStyle={resolvedStyle}
        >
          {childNodes}
        </PreviewFormNode>
      );
    case "Text":
      return (
        <Typography
          className={resolvedClassName}
          style={resolvedStyle}
          variant={node.props.variant}
          component={node.props.component}
        >
          {node.props.children}
        </Typography>
      );
    case "Button": {
      const resolvedActionType =
        node.props.actionType || (node.props.pageSlug ? "navigate" : "none");
      const buttonHref =
        resolvedActionType === "navigate" && node.props.pageSlug
          ? `/builder/preview?page=${encodeURIComponent(node.props.pageSlug)}`
          : undefined;
      return (
        <Button
          className={resolvedClassName}
          style={resolvedStyle}
          variant={node.props.variant}
          icon={node.props.icon}
          iconPos={node.props.iconPos}
          component={buttonHref ? "a" : undefined}
          href={buttonHref}
          onClick={
            resolvedActionType === "openPopup" && node.props.popupId
              ? () => onOpenPopup(node.props.popupId)
              : undefined
          }
        >
          {node.props.children}
        </Button>
      );
    }
    case "Link": {
      return (
        <LinkNode
          className={resolvedClassName}
          style={resolvedStyle}
          linkType={node.props.linkType}
          pageSlug={node.props.pageSlug}
          externalUrl={node.props.externalUrl}
          openInNewTab={node.props.openInNewTab}
          enableHoverMenu={node.props.enableHoverMenu}
          hoverMenuItems={node.props.hoverMenuItems}
          hoverMenuLayout={node.props.hoverMenuLayout}
          hoverMenuColumns={node.props.hoverMenuColumns}
          hoverMenuMinWidth={node.props.hoverMenuMinWidth}
          underline={node.props.underline}
          color={node.props.color}
          resolveInternalHref={(slug) =>
            `/builder/preview?page=${encodeURIComponent(slug || "/")}`
          }
        >
          {node.props.children}
        </LinkNode>
      );
    }
    case "Input":
      const { wrapperClassName, inputClassName } =
        splitMarginClasses(resolvedClassName);
      const { wrapperStyle, inputStyle } = splitMarginStyle(resolvedStyle);
      return (
        <div
          className={`flex flex-col gap-1 w-full ${wrapperClassName}`.trim()}
          style={wrapperStyle}
        >
          {node.props.label && (
            <label
              className="text-sm font-medium text-gray-700"
              style={
                node.props.labelColor
                  ? { color: node.props.labelColor }
                  : undefined
              }
            >
              {node.props.label}
            </label>
          )}
          <PreviewInputField
            node={node}
            inputClassName={inputClassName}
            inputStyle={inputStyle}
          />
        </div>
      );
    case "Select":
      return (
        <Select
          className={resolvedClassName}
          caption={node.props.caption}
          label={node.props.label}
          options={node.props.options || []}
          style={resolvedStyle}
          fullWidth
          value={node.props.value ?? node.props.options?.[0]?.value ?? ""}
        />
      );
    case "MultiSelect":
      return (
        <MultiSelect
          className={resolvedClassName}
          caption={node.props.caption}
          label={node.props.label}
          options={node.props.options || []}
          style={resolvedStyle}
          fullWidth
          value={node.props.value || []}
        />
      );
    case "RadioGroup":
      return (
        <PreviewRadioGroupField
          className={resolvedClassName}
          style={resolvedStyle}
          caption={node.props.caption}
          label={node.props.label}
          options={node.props.options || []}
          value={node.props.value}
          row={node.props.row}
        />
      );
    case "Rating":
      return (
        <PreviewRatingField
          className={resolvedClassName}
          style={resolvedStyle}
          caption={node.props.caption}
          label={node.props.label}
          value={node.props.value}
          max={node.props.max}
          precision={node.props.precision}
          readOnly={node.props.readOnly}
          size={node.props.size}
        />
      );
    case "Checkbox":
      return (
        <PreviewCheckboxField
          className={resolvedClassName}
          style={resolvedStyle}
          caption={node.props.caption}
          label={node.props.label}
          checked={Boolean(node.props.checked)}
        />
      );
    case "Switch":
      return (
        <PreviewSwitchField
          className={resolvedClassName}
          style={resolvedStyle}
          caption={node.props.caption}
          label={node.props.label}
          checked={node.props.checked}
          size={node.props.size}
        />
      );
    case "Image":
      return (
        <img
          src={node.props.src || "https://placehold.co/300x180"}
          alt={node.props.alt || "image"}
          className={resolvedClassName || "max-w-full h-auto"}
          style={resolvedStyle}
        />
      );
    case "Textarea":
      return (
        <textarea
          className={resolvedClassName || "border p-2 rounded w-full"}
          style={resolvedStyle}
          placeholder={node.props.placeholder}
        />
      );
    case "MaterialIcon":
      return (
        <MaterialIcon
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "DataGrid":
      return (
        <DataGrid
          {...node.props}
          isPreview={true}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "Charts":
      return (
        <Charts
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "DatePicker":
      return (
        <DatePicker
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "TimePicker":
      return (
        <TimePicker
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "DateTimePicker":
      return (
        <DateTimePicker
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        />
      );
    case "Tabs":
      return (
        <PreviewTabs
          items={(node.props.items || []) as TabItem[]}
          defaultValue={node.props.defaultValue ?? 0}
          className={resolvedClassName}
          style={resolvedStyle}
        >
          {childNodes}
        </PreviewTabs>
      );
    case "Stepper":
      return (
        <Stepper
          {...node.props}
          className={resolvedClassName}
          style={resolvedStyle}
        >
          {childNodes}
        </Stepper>
      );
    default:
      return null;
  }
};

const SidebarPreviewSection = ({
  section,
  children,
  side,
}: {
  section: SiteSections["sidebarLeft"] | SiteSections["sidebarRight"];
  children: React.ReactNode;
  side: "left" | "right";
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    Boolean(section.collapsedByDefault),
  );

  useEffect(() => {
    setIsCollapsed(Boolean(section.collapsedByDefault));
  }, [section.collapsedByDefault]);

  const expandedWidth = Math.max(180, Number(section.width) || 280);
  const collapsedWidth = Math.max(44, Number(section.collapsedWidth) || 64);
  const effectiveWidth = isCollapsed ? collapsedWidth : expandedWidth;
  const collapsible = Boolean(section.collapsible);

  return (
    <aside
      className="relative shrink-0 border-gray-200 bg-white"
      style={{
        width: `${effectiveWidth}px`,
        transition: "width 200ms ease",
      }}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={`absolute top-3 z-10 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50 ${side === "left" ? "right-2" : "left-2"}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed
            ? side === "left"
              ? ">"
              : "<"
            : side === "left"
              ? "<"
              : ">"}
        </button>
      ) : null}
      <div
        className={`h-full overflow-auto ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {children}
      </div>
    </aside>
  );
};

export default function BuilderPreviewPage() {
  const initialSite = useLoaderData() as SiteSnapshot | null;
  const [site] = useState<SiteSnapshot | null>(initialSite);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const location = useLocation();

  const selectedPage = useMemo(() => {
    if (!site) return null;
    const params = new URLSearchParams(location.search);
    const slug = params.get("page");
    if (slug) return site.pages.find((page) => page.slug === slug) || null;
    return (
      site.pages.find((page) => page.id === site.currentPageId) ||
      site.pages[0] ||
      null
    );
  }, [site, location.search]);

  const customStyleById = useMemo(() => {
    const styles = site?.customStyles || [];
    return new Map(styles.map((style) => [style.id, style]));
  }, [site]);
  const popupById = useMemo(() => {
    const popups = site?.popups || [];
    return new Map(popups.map((popup) => [popup.id, popup]));
  }, [site]);

  const customCss = useMemo(
    () => compileCustomStylesCss(site?.customStyles || []),
    [site],
  );

  const pageLayout = selectedPage?.layout;
  const showHeader = Boolean(site?.siteSections?.header?.enabled) && (pageLayout?.showHeader ?? true);
  const showFooter = Boolean(site?.siteSections?.footer?.enabled) && (pageLayout?.showFooter ?? true);

  const headerContent = useMemo(() => {
    if (!showHeader) return null;
    return site.siteSections.header.nodes.map((node) => (
      <PreviewNode
        key={`header-${node.id}`}
        node={node}
        customStyleById={customStyleById}
        onOpenPopup={setOpenPopupId}
      />
    ));
  }, [
    customStyleById,
    showHeader,
    site?.siteSections?.header?.nodes,
  ]);

  const pageContent = useMemo(() => {
    if (!selectedPage) return null;
    return selectedPage.nodes.map((node) => (
      <PreviewNode
        key={node.id}
        node={node}
        customStyleById={customStyleById}
        onOpenPopup={setOpenPopupId}
      />
    ));
  }, [selectedPage, customStyleById]);

  const footerContent = useMemo(() => {
    if (!showFooter) return null;
    return site.siteSections.footer.nodes.map((node) => (
      <PreviewNode
        key={`footer-${node.id}`}
        node={node}
        customStyleById={customStyleById}
        onOpenPopup={setOpenPopupId}
      />
    ));
  }, [
    customStyleById,
    showFooter,
    site?.siteSections?.footer?.nodes,
  ]);

  const activePopup = openPopupId ? popupById.get(openPopupId) || null : null;
  const leftSidebar = site?.siteSections?.sidebarLeft;
  const rightSidebar = site?.siteSections?.sidebarRight;
  const showLeftSidebar = Boolean(leftSidebar?.enabled) && (pageLayout?.showLeftSidebar ?? true);
  const showRightSidebar = Boolean(rightSidebar?.enabled) && (pageLayout?.showRightSidebar ?? true);

  if (!selectedPage) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Preview Unavailable
          </h1>
          <p className="text-sm text-gray-600">
            Open preview from the builder page after creating content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-auto bg-white">
      {customCss ? <style>{customCss}</style> : null}
      {headerContent}
      <div className="flex w-full items-stretch">
        {showLeftSidebar && leftSidebar ? (
          <SidebarPreviewSection section={leftSidebar} side="left">
            {leftSidebar.nodes.map((node) => (
              <PreviewNode
                key={`sidebar-left-${node.id}`}
                node={node}
                customStyleById={customStyleById}
                onOpenPopup={setOpenPopupId}
              />
            ))}
          </SidebarPreviewSection>
        ) : null}
        <main className="min-w-0 flex-1">{pageContent}</main>
        {showRightSidebar && rightSidebar ? (
          <SidebarPreviewSection section={rightSidebar} side="right">
            {rightSidebar.nodes.map((node) => (
              <PreviewNode
                key={`sidebar-right-${node.id}`}
                node={node}
                customStyleById={customStyleById}
                onOpenPopup={setOpenPopupId}
              />
            ))}
          </SidebarPreviewSection>
        ) : null}
      </div>
      {footerContent}
      <MuiDialog
        open={Boolean(activePopup)}
        onClose={() => setOpenPopupId(null)}
        fullWidth
        maxWidth="md"
      >
        {activePopup ? (
          <>
            <DialogTitle>{activePopup.name}</DialogTitle>
            <DialogContent>
              {activePopup.nodes.map((node) => (
                <PreviewNode
                  key={`popup-${node.id}`}
                  node={node}
                  customStyleById={customStyleById}
                  onOpenPopup={setOpenPopupId}
                />
              ))}
            </DialogContent>
          </>
        ) : null}
      </MuiDialog>
    </div>
  );
}
