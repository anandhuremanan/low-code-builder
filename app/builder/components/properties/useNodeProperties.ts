import { useEffect, useState } from "react";
import { useBuilder } from "../../context";
import {
  TEXT_SIZE_CLASSES,
  TEXT_ALIGN_CLASSES,
  OBJECT_FIT_CLASSES,
  extractTokenFromClass,
  extractPaddingTokens,
  extractMarginTokens,
  widthTokenToPx,
  styleTokenToCss,
  replaceTokenInClass,
  replacePaddingTokens,
  replaceMarginTokens,
  paddingTokensToStyle,
  sizeTokenToStyle,
  isHexColor,
  sideToBorderProp,
  TEXT_ELEMENT_OPTIONS,
  marginTokensToStyle,
} from "./styleHelpers";
import {
  updateClass,
  getTailwindValue,
  getBorderValue,
  updateBorderClass,
  getEffectValue,
  updateEffectClass,
} from "../../../lib/styleUtils";
import type {
  TextElementValue,
  TextFormatValue,
  NavMenuItem,
} from "./styleHelpers";

export const useNodeProperties = () => {
  const { state, dispatch } = useBuilder();
  const selectedNodeId = state.selectedNodeId;

  const findNode = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNode(node.children, id);
      if (found) return found;
    }
    return null;
  };

  const currentPage = state.pages.find((p) => p.id === state.currentPageId);
  const activeNodes =
    state.editingTarget === "page"
      ? currentPage?.nodes || []
      : state.siteSections[state.editingTarget].nodes;
  const selectedNode =
    selectedNodeId && activeNodes.length > 0
      ? findNode(activeNodes, selectedNodeId)
      : null;
  const pageOptions = state.pages.map((page) => ({
    label: page.name,
    value: page.slug,
  }));

  const [styles, setStyles] = useState({
    width: "",
    height: "",
    paddingTop: "",
    paddingRight: "",
    paddingBottom: "",
    paddingLeft: "",
    marginTop: "",
    marginRight: "",
    marginBottom: "",
    marginLeft: "",
    fontSize: "",
    textAlign: "",
    objectFit: "",
  });
  const [borderState, setBorderState] = useState({
    radius: "",
    width: "",
    color: "",
    style: "",
  });
  const [borderSide, setBorderSide] = useState<
    "all" | "top" | "right" | "bottom" | "left"
  >("all");
  const [effectState, setEffectState] = useState({
    shadow: "",
    opacity: "",
  });
  const [dataGridProps, setDataGridProps] = useState({
    apiUrl: "",
    columns: [] as any[],
  });

  const [textTypography, setTextTypography] = useState<{
    element: TextElementValue;
    format: TextFormatValue;
  }>({
    element: "p",
    format: "normal",
  });

  const [localProps, setLocalProps] = useState<Record<string, any>>({});

  const cssLengthToPixelInput = (value: unknown): string => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^-?\d+(\.\d+)?px$/.test(trimmed)) {
      return String(Number(trimmed.replace("px", "")));
    }
    if (/^-?\d+(\.\d+)?rem$/.test(trimmed)) {
      const rem = Number(trimmed.replace("rem", ""));
      return String(rem * 16);
    }
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return String(Number(trimmed));
    }
    return "";
  };

  const cssSizeToInput = (value: unknown): string => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `${value}px`;
    }
    if (typeof value === "string") return value.trim();
    return "";
  };

  const toCssSizeValue = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    if (/^-?\d+(\.\d+)?(px|rem|em|%|vh|vw)$/.test(trimmed)) return trimmed;
    if (trimmed === "full") return "100%";
    if (trimmed === "screen") return "100vh";
    if (/^calc\(.+\)$/.test(trimmed)) return trimmed;
    return null;
  };

  const removeDimensionClassTokens = (
    className: string,
    field: "width" | "height",
  ): string => {
    const tokens = className.split(/\s+/).filter(Boolean);
    return tokens
      .filter((token) => {
        if (field === "width") {
          return (
            !/^w-/.test(token) &&
            !/^min-w-/.test(token) &&
            !/^max-w-/.test(token)
          );
        }
        return (
          !/^h-/.test(token) &&
          !/^min-h-/.test(token) &&
          !/^max-h-/.test(token)
        );
      })
      .join(" ");
  };

  const classSizeTokenToInput = (
    token: string,
    field: "width" | "height",
  ): string => {
    if (!token) return "";
    const converted = sizeTokenToStyle(token);
    const value = converted[field];
    if (typeof value !== "string") return "";
    return value;
  };

  useEffect(() => {
    if (selectedNode) {
      setLocalProps(selectedNode.props);
      const className = selectedNode.props.className || "";
      const paddingFromClass = paddingTokensToStyle(extractPaddingTokens(className));
      const marginFromClass = marginTokensToStyle(extractMarginTokens(className));
      const resolvedStyle = {
        ...paddingFromClass,
        ...marginFromClass,
        ...(selectedNode.props?.style || {}),
      } as Record<string, any>;

      const widthToken = getTailwindValue(className, "w-");
      const heightToken = getTailwindValue(className, "h-");
      setStyles({
        width:
          cssSizeToInput(resolvedStyle.width) ||
          classSizeTokenToInput(widthToken, "width"),
        height:
          cssSizeToInput(resolvedStyle.height) ||
          classSizeTokenToInput(heightToken, "height"),
        paddingTop: cssLengthToPixelInput(
          resolvedStyle.paddingTop ?? resolvedStyle.padding,
        ),
        paddingRight: cssLengthToPixelInput(
          resolvedStyle.paddingRight ?? resolvedStyle.padding,
        ),
        paddingBottom: cssLengthToPixelInput(
          resolvedStyle.paddingBottom ?? resolvedStyle.padding,
        ),
        paddingLeft: cssLengthToPixelInput(
          resolvedStyle.paddingLeft ?? resolvedStyle.padding,
        ),
        marginTop: cssLengthToPixelInput(
          resolvedStyle.marginTop ?? resolvedStyle.margin,
        ),
        marginRight: cssLengthToPixelInput(
          resolvedStyle.marginRight ?? resolvedStyle.margin,
        ),
        marginBottom: cssLengthToPixelInput(
          resolvedStyle.marginBottom ?? resolvedStyle.margin,
        ),
        marginLeft: cssLengthToPixelInput(
          resolvedStyle.marginLeft ?? resolvedStyle.margin,
        ),
        fontSize: extractTokenFromClass(className, TEXT_SIZE_CLASSES),
        textAlign: extractTokenFromClass(className, TEXT_ALIGN_CLASSES),
        objectFit: extractTokenFromClass(className, OBJECT_FIT_CLASSES),
      });
      setBorderState({
        radius: getBorderValue(className, "radius"),
        width: String(
          selectedNode.props?.style?.borderWidth ||
            widthTokenToPx(getBorderValue(className, "width")) ||
            "",
        ),
        color: selectedNode.props?.style?.borderColor || "",
        style: String(
          selectedNode.props?.style?.borderStyle ||
            styleTokenToCss(getBorderValue(className, "style")) ||
            "",
        ),
      });
      setEffectState({
        shadow: getEffectValue(className, "shadow"),
        opacity: getEffectValue(className, "opacity"),
      });
      if (selectedNode.type === "DataGrid") {
        setDataGridProps({
          apiUrl: selectedNode.props.apiUrl || "",
          columns: selectedNode.props.columns || [],
        });
      }
      const variant = selectedNode.props?.variant || "body1";
      const style = selectedNode.props?.style || {};
      const currentFormat: TextFormatValue =
        style.fontStyle === "italic"
          ? "italic"
          : Number(style.fontWeight || 400) >= 700
            ? "bold"
            : "normal";
      const matchingElement =
        TEXT_ELEMENT_OPTIONS.find((item) => item.variant === variant)?.value ||
        "p";
      setTextTypography({
        element: matchingElement,
        format: currentFormat,
      });
    }
  }, [selectedNode?.id]);

  const handleChange = (key: string, value: any) => {
    if (!selectedNode) return;
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { [key]: value } },
    });
  };

  const handleCustomStyleChange = (styleId: string) => {
    if (!selectedNode) return;
    const nextProps = { ...localProps };
    if (styleId) {
      nextProps.customStyleId = styleId;
    } else {
      delete nextProps.customStyleId;
    }

    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        id: selectedNode.id,
        props: { customStyleId: styleId || undefined },
      },
    });
  };

  const handleStyleChange = (
    field: "width" | "height" | "fontSize" | "textAlign" | "objectFit",
    prefix: string,
    value: string,
  ) => {
    if (!selectedNode) return;
    setStyles((prev) => ({ ...prev, [field]: value }));

    const currentClass = localProps.className || "";
    const isSizeField = field === "width" || field === "height";
    const rawInput = value.trim();
    const cssSizeValue = isSizeField ? toCssSizeValue(rawInput) : null;

    const newClass =
      field === "fontSize"
        ? replaceTokenInClass(currentClass, TEXT_SIZE_CLASSES, value)
        : field === "textAlign"
          ? replaceTokenInClass(
              currentClass,
              TEXT_ALIGN_CLASSES,
              value,
            )
          : field === "objectFit"
            ? replaceTokenInClass(
              currentClass,
              OBJECT_FIT_CLASSES,
              value,
            )
            : removeDimensionClassTokens(currentClass, field);

    const nextProps: Record<string, any> = { className: newClass };
    if (isSizeField) {
      const currentStyle = { ...(localProps.style || {}) };
      if (field === "width") delete currentStyle.width;
      if (field === "height") delete currentStyle.height;
      const nextStyle = { ...currentStyle };
      if (cssSizeValue) {
        if (field === "width") nextStyle.width = cssSizeValue;
        if (field === "height") nextStyle.height = cssSizeValue;
      }
      nextProps.style = nextStyle;
    }

    setLocalProps((prev) => ({ ...prev, ...nextProps }));

    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: nextProps },
    });
  };

  const handleBoxSpacingChange = (
    kind: "padding" | "margin",
    side: "top" | "right" | "bottom" | "left",
    value: string,
  ) => {
    if (!selectedNode) return;
    const normalized = value.replace(/[^0-9.-]/g, "");
    const styleKey =
      `${kind}${side[0].toUpperCase()}${side.slice(1)}` as
        | "paddingTop"
        | "paddingRight"
        | "paddingBottom"
        | "paddingLeft"
        | "marginTop"
        | "marginRight"
        | "marginBottom"
        | "marginLeft";

    setStyles((prev) => ({ ...prev, [styleKey]: normalized }));

    const nextStyle = { ...(localProps.style || {}) } as Record<string, any>;
    delete nextStyle[kind];

    if (!normalized.trim()) {
      delete nextStyle[styleKey];
    } else {
      const numeric = Number(normalized);
      if (!Number.isFinite(numeric)) return;
      nextStyle[styleKey] = `${numeric}px`;
    }

    const currentClass = localProps.className || "";
    const cleanedClass =
      kind === "padding"
        ? replacePaddingTokens(currentClass, "")
        : replaceMarginTokens(currentClass, "");

    const nextProps = {
      ...localProps,
      className: cleanedClass,
      style: nextStyle,
    };

    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: nextProps },
    });
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    dispatch({ type: "DELETE_NODE", payload: { id: selectedNode.id } });
    dispatch({ type: "SELECT_NODE", payload: { id: null } });
  };

  const handleNodeStyleChange = (key: string, value: string) => {
    if (!selectedNode) return;
    const nextStyle = { ...(localProps.style || {}), [key]: value };
    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const handleImageUpload = (file: File | null) => {
    if (!file || !selectedNode) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      const nextProps = { ...localProps, src };
      setLocalProps(nextProps);
      dispatch({
        type: "UPDATE_NODE",
        payload: { id: selectedNode.id, props: { src } },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageSizeChange = (key: "width" | "height", value: string) => {
    if (!selectedNode) return;
    const nextStyle = { ...(localProps.style || {}) };
    if (!value.trim()) {
      delete nextStyle[key];
    } else {
      nextStyle[key] = `${value}px`;
    }
    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const getMenuItems = (): NavMenuItem[] => {
    const items = localProps.menuItems;
    if (!Array.isArray(items)) return [];
    return items as NavMenuItem[];
  };

  const updateMenuItems = (menuItems: NavMenuItem[]) => {
    if (!selectedNode) return;
    const nextProps = { ...localProps, menuItems };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { menuItems } },
    });
  };

  const addMenuItem = () => {
    const items = [...getMenuItems()];
    items.push({
      id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "New Menu",
      pageSlug: pageOptions[0]?.value || "/",
      children: [],
    });
    updateMenuItems(items);
  };

  const removeMenuItem = (index: number) => {
    const items = [...getMenuItems()];
    items.splice(index, 1);
    updateMenuItems(items);
  };

  const updateMenuItem = (
    index: number,
    key: "label" | "pageSlug",
    value: string,
  ) => {
    const items = [...getMenuItems()];
    const current = items[index];
    if (!current) return;
    items[index] = { ...current, [key]: value };
    updateMenuItems(items);
  };

  const addSubMenuItem = (menuIndex: number) => {
    const items = [...getMenuItems()];
    const current = items[menuIndex];
    if (!current) return;
    const children = [...(current.children || [])];
    children.push({
      id: `submenu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "New Submenu",
      pageSlug: pageOptions[0]?.value || "/",
    });
    items[menuIndex] = { ...current, children };
    updateMenuItems(items);
  };

  const removeSubMenuItem = (menuIndex: number, childIndex: number) => {
    const items = [...getMenuItems()];
    const current = items[menuIndex];
    if (!current) return;
    const children = [...(current.children || [])];
    children.splice(childIndex, 1);
    items[menuIndex] = { ...current, children };
    updateMenuItems(items);
  };

  const updateSubMenuItem = (
    menuIndex: number,
    childIndex: number,
    key: "label" | "pageSlug",
    value: string,
  ) => {
    const items = [...getMenuItems()];
    const current = items[menuIndex];
    if (!current) return;
    const children = [...(current.children || [])];
    const child = children[childIndex];
    if (!child) return;
    children[childIndex] = { ...child, [key]: value };
    items[menuIndex] = { ...current, children };
    updateMenuItems(items);
  };

  const handleButtonStyleChange = (
    key: "backgroundColor" | "color",
    value: string,
  ) => {
    handleNodeStyleChange(key, value);
  };

  const handleContainerAlignmentChange = (
    axis: "horizontal" | "vertical",
    value: string,
  ) => {
    if (!selectedNode) return;
    const nextStyle = { ...(localProps.style || {}), display: "flex" };
    if (axis === "horizontal") {
      nextStyle.justifyContent = value;
    } else {
      nextStyle.alignItems = value;
    }
    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const getContainerFlow = (): "block" | "column" | "row" | "row-wrap" => {
    const style = localProps.style || {};
    if (style.display !== "flex") return "block";
    if (style.flexDirection === "column") return "column";
    if (style.flexDirection === "row" && style.flexWrap === "wrap")
      return "row-wrap";
    return "row";
  };

  const handleContainerFlowChange = (
    value: "block" | "column" | "row" | "row-wrap",
  ) => {
    if (!selectedNode) return;
    const nextStyle = { ...(localProps.style || {}) };

    if (value === "block") {
      delete nextStyle.display;
      delete nextStyle.flexDirection;
      delete nextStyle.flexWrap;
      delete nextStyle.justifyContent;
      delete nextStyle.alignItems;
    } else if (value === "column") {
      nextStyle.display = "flex";
      nextStyle.flexDirection = "column";
      nextStyle.flexWrap = "nowrap";
    } else if (value === "row") {
      nextStyle.display = "flex";
      nextStyle.flexDirection = "row";
      nextStyle.flexWrap = "nowrap";
    } else {
      nextStyle.display = "flex";
      nextStyle.flexDirection = "row";
      nextStyle.flexWrap = "wrap";
    }

    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const handleTextElementChange = (value: TextElementValue) => {
    if (!selectedNode) return;
    const selected = TEXT_ELEMENT_OPTIONS.find((item) => item.value === value);
    if (!selected) return;

    setTextTypography((prev) => ({ ...prev, element: value }));
    const nextProps = {
      ...localProps,
      variant: selected.variant,
      component: selected.component,
    };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        id: selectedNode.id,
        props: { variant: selected.variant, component: selected.component },
      },
    });
  };

  const handleTextFormatPresetChange = (value: TextFormatValue) => {
    if (!selectedNode) return;
    setTextTypography((prev) => ({ ...prev, format: value }));

    const nextStyle = { ...(localProps.style || {}) };
    if (value === "bold") {
      nextStyle.fontWeight = 700;
      nextStyle.fontStyle = "normal";
    } else if (value === "italic") {
      nextStyle.fontWeight = 400;
      nextStyle.fontStyle = "italic";
    } else {
      nextStyle.fontWeight = 400;
      nextStyle.fontStyle = "normal";
    }

    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const handleTextColorChange = (value: string) => {
    if (!selectedNode) return;
    const nextStyle = { ...(localProps.style || {}), color: value };
    const nextProps = { ...localProps, style: nextStyle };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { style: nextStyle } },
    });
  };

  const handleOptionChange = (
    idx: number,
    field: "label" | "value",
    val: string,
  ) => {
    const options = [...(localProps.options || [])];
    options[idx] = { ...options[idx], [field]: val };
    handleChange("options", options);
  };

  const addOption = () => {
    const options = [...(localProps.options || [])];
    options.push({ label: "New Option", value: "new_value" });
    handleChange("options", options);
  };

  const removeOption = (idx: number) => {
    const options = [...(localProps.options || [])];
    options.splice(idx, 1);
    handleChange("options", options);
  };

  const handleBorderChange = (
    field: "radius" | "width" | "color" | "style",
    value: string,
  ) => {
    if (!selectedNode) return;
    setBorderState((prev) => ({ ...prev, [field]: value }));
    const currentClass = localProps.className || "";
    if (field === "radius") {
      const newClass = updateBorderClass(currentClass, field, value);
      const nextProps = { ...localProps, className: newClass };
      setLocalProps(nextProps);
      dispatch({
        type: "UPDATE_NODE",
        payload: { id: selectedNode.id, props: nextProps },
      });
      return;
    }

    const sideProp = sideToBorderProp(borderSide, field);
    const nextStyle = { ...(localProps.style || {}) } as Record<string, any>;
    const cleanedClass = updateBorderClass(
      updateBorderClass(
        updateBorderClass(currentClass, "width", ""),
        "style",
        "",
      ),
      "color",
      "",
    );
    const nextValue =
      field === "width" || field === "style" ? value.trim() : value.trim();
    if (nextValue) {
      nextStyle[sideProp] = nextValue;
    } else {
      delete nextStyle[sideProp];
    }

    const nextProps = {
      ...localProps,
      className: cleanedClass,
      style: nextStyle,
    };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: nextProps },
    });
  };

  const handleEffectChange = (field: "shadow" | "opacity", value: string) => {
    if (!selectedNode) return;
    setEffectState((prev) => ({ ...prev, [field]: value }));
    const currentClass = localProps.className || "";
    const newClass = updateEffectClass(currentClass, field, value);

    const nextProps = { ...localProps, className: newClass };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: nextProps },
    });
  };

  const handleDataGridChange = (key: "apiUrl" | "columns", value: any) => {
    if (!selectedNode) return;
    setDataGridProps((prev) => ({ ...prev, [key]: value }));
    const nextProps = { ...localProps, [key]: value };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: nextProps },
    });
  };

  const addDataGridColumn = () => {
    const columns = [...(dataGridProps.columns || [])];
    columns.push({ field: "newField", headerName: "New Column", width: 150 });
    handleDataGridChange("columns", columns);
  };

  const updateDataGridColumn = (index: number, key: string, val: any) => {
    const columns = [...(dataGridProps.columns || [])];
    columns[index] = { ...columns[index], [key]: val };
    handleDataGridChange("columns", columns);
  };

  const removeDataGridColumn = (index: number) => {
    const columns = [...(dataGridProps.columns || [])];
    columns.splice(index, 1);
    handleDataGridChange("columns", columns);
  };

  const parseCsvLabels = (raw: string): string[] =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const parseCsvNumbers = (raw: string): number[] =>
    raw
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));

  const getChartPointColors = (): string[] => {
    const colors = localProps.pointColors;
    if (!Array.isArray(colors)) return [];
    return colors as string[];
  };

  const updateChartPointColor = (index: number, value: string) => {
    const labels = Array.isArray(localProps.labels) ? localProps.labels : [];
    const targetLength = Math.max(labels.length, index + 1);
    const base = getChartPointColors();
    const fallback = localProps.color || "#1976d2";
    const next = Array.from(
      { length: targetLength },
      (_, i) => base[i] || fallback,
    );
    next[index] = value;
    handleChange("pointColors", next);
  };

  const getTabsItems = (): { label: string; id: string }[] => {
    const items = localProps.items;
    if (!Array.isArray(items)) return [];
    return items as { label: string; id: string }[];
  };

  const updateTabsItems = (items: { label: string; id: string }[]) => {
    if (!selectedNode) return;
    const nextProps = { ...localProps, items };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { items } },
    });
  };

  const addTabItem = () => {
    const items = [...getTabsItems()];
    items.push({
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: "New Tab",
    });
    updateTabsItems(items);
  };

  const removeTabItem = (index: number) => {
    if (!selectedNode) return;
    const items = [...getTabsItems()];
    items.splice(index, 1);
    updateTabsItems(items);

    if (selectedNode.children && selectedNode.children[index]) {
      dispatch({
        type: "DELETE_NODE",
        payload: { id: selectedNode.children[index].id },
      });
    }
  };

  const updateTabItem = (index: number, label: string) => {
    const items = [...getTabsItems()];
    if (!items[index]) return;
    items[index] = { ...items[index], label };
    updateTabsItems(items);
  };

  const getStepperItems = (): { label: string; optional?: boolean }[] => {
    const steps = localProps.steps;
    if (!Array.isArray(steps)) return [];
    return steps as { label: string; optional?: boolean }[];
  };

  const updateStepperItems = (
    steps: { label: string; optional?: boolean }[],
  ) => {
    if (!selectedNode) return;
    const nextProps = { ...localProps, steps };
    setLocalProps(nextProps);
    dispatch({
      type: "UPDATE_NODE",
      payload: { id: selectedNode.id, props: { steps } },
    });
  };

  const createStepperContentContainer = (label?: string) => ({
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "Container" as const,
    props: {
      className: "p-4 border border-dashed border-gray-200 min-h-[100px]",
      children: `Content for ${label || "step"}`,
    },
    children: [],
  });

  const addStepperContentContainer = (index: number, label?: string) => {
    if (!selectedNode) return;
    dispatch({
      type: "ADD_NODE",
      payload: {
        parentId: selectedNode.id,
        node: createStepperContentContainer(label),
        index,
      },
    });
  };

  const ensureStepperStepContainers = (
    steps: { label: string; optional?: boolean }[],
  ) => {
    if (!selectedNode) return;
    const existingCount = selectedNode.children?.length || 0;
    if (existingCount >= steps.length) return;

    for (let i = existingCount; i < steps.length; i += 1) {
      addStepperContentContainer(i, steps[i]?.label);
    }
  };

  const addStepperItem = () => {
    const steps = [...getStepperItems()];
    const newStep = {
      label: `Step ${steps.length + 1}`,
      optional: false,
    };
    steps.push(newStep);
    updateStepperItems(steps);
    addStepperContentContainer(steps.length - 1, newStep.label);
  };

  const removeStepperItem = (index: number) => {
    if (!selectedNode) return;
    const steps = [...getStepperItems()];
    steps.splice(index, 1);
    updateStepperItems(steps);

    const nextActiveStep = Math.max(
      0,
      Math.min(Number(localProps.activeStep || 0), steps.length),
    );
    handleChange("activeStep", nextActiveStep);

    if (selectedNode.children && selectedNode.children[index]) {
      dispatch({
        type: "DELETE_NODE",
        payload: { id: selectedNode.children[index].id },
      });
    }
  };

  const updateStepperItem = (
    index: number,
    key: "label" | "optional",
    value: string | boolean,
  ) => {
    const steps = [...getStepperItems()];
    if (!steps[index]) return;
    steps[index] = { ...steps[index], [key]: value };
    updateStepperItems(steps);
  };

  return {
    state,
    dispatch,
    selectedNode,
    pageOptions,
    styles,
    setStyles,
    borderState,
    setBorderState,
    borderSide,
    setBorderSide,
    effectState,
    setEffectState,
    dataGridProps,
    setDataGridProps,
    textTypography,
    setTextTypography,
    localProps,
    setLocalProps,
    handleChange,
    handleCustomStyleChange,
    handleStyleChange,
    handleBoxSpacingChange,
    handleDelete,
    handleNodeStyleChange,
    handleImageUpload,
    handleImageSizeChange,
    getMenuItems,
    updateMenuItems,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    addSubMenuItem,
    removeSubMenuItem,
    updateSubMenuItem,
    handleButtonStyleChange,
    handleContainerAlignmentChange,
    getContainerFlow,
    handleContainerFlowChange,
    handleTextElementChange,
    handleTextFormatPresetChange,
    handleTextColorChange,
    handleOptionChange,
    addOption,
    removeOption,
    handleBorderChange,
    handleEffectChange,
    handleDataGridChange,
    addDataGridColumn,
    updateDataGridColumn,
    removeDataGridColumn,
    parseCsvLabels,
    parseCsvNumbers,
    getChartPointColors,
    updateChartPointColor,
    getTabsItems,
    updateTabsItems,
    addTabItem,
    removeTabItem,
    updateTabItem,
    getStepperItems,
    updateStepperItems,
    createStepperContentContainer,
    addStepperContentContainer,
    ensureStepperStepContainers,
    addStepperItem,
    removeStepperItem,
    updateStepperItem,
  };
};

export type NodeProperties = ReturnType<typeof useNodeProperties>;
