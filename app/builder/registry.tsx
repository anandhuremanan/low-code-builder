import React from "react";
import {
  Box as BoxIcon,
  Type as TextIcon,
  MousePointer2 as ButtonIcon,
  TextCursorInput as InputIcon,
  List as SelectIcon,
  CheckSquare as CheckboxIcon,
  ToggleLeft as SwitchIcon,
  Layout as ContainerIcon,
  FileText as FormIcon,
  Table as TableIcon,
  BarChart3 as ChartIcon,
  Star as StarIcon,
  Calendar as CalendarIcon,
  ListOrdered as StepperIcon,
  Clock3 as TimePickerIcon,
  StarHalf as RatingIcon,
  Link2 as LinkIcon,
} from "lucide-react";
import { type RegisteredComponent, type ComponentType } from "./types";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { Switch as SwitchUI } from "../components/ui/Switch";
import { Box } from "../components/ui/Box";
import { Typography } from "../components/ui/Typography";
import { DataGrid } from "./components/DataGrid";
import { Charts } from "./components/Charts";
import { Container } from "./components/Container";
import { Form } from "./components/Form";
import { Tabs } from "./components/Tabs";
import { MaterialIcon } from "./components/MaterialIcon";
import { DatePicker } from "./components/DatePicker";
import { TimePicker } from "./components/TimePicker";
import { DateTimePicker } from "./components/DateTimePicker";
import { MultiSelect } from "../components/ui/MultiSelect";
import { Stepper } from "./components/Stepper";
import { RadioGroup as RadioGroupUI } from "../components/ui/RadioGroup";
import { Rating as RatingUI } from "../components/ui/Rating";
import { LinkNode } from "./components/LinkNode";

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

const DEFAULT_COMPONENT_MARGIN_STYLE: React.CSSProperties = {
  marginTop: "12px",
};

const withDefaultVerticalMargins = <T extends Record<string, any>>(
  defaultProps: T,
): T => ({
  ...defaultProps,
  style: {
    ...DEFAULT_COMPONENT_MARGIN_STYLE,
    ...(defaultProps.style || {}),
  },
});

export const COMPONENT_REGISTRY: Record<ComponentType, RegisteredComponent> = {
  Container: {
    name: "Container",
    category: "layout",
    icon: ContainerIcon,
    component: Container,
    defaultProps: withDefaultVerticalMargins({
      className: "p-4 border border-dashed border-gray-300 w-full",
    }),
  },
  Form: {
    name: "Form",
    category: "layout",
    icon: FormIcon,
    component: Form,
    defaultProps: withDefaultVerticalMargins({
      className: "p-4 border border-dashed border-gray-300 w-full rounded",
      showSubmitButton: true,
      submitButtonText: "Submit",
      submitButtonVariant: "contained",
    }),
  },
  Button: {
    name: "Button",
    category: "basic",
    icon: ButtonIcon,
    component: ({
      actionType,
      pageSlug,
      popupId,
      onNavigateToPageSlug,
      onOpenPopup,
      onClick,
      node,
      ...props
    }: any) => (
      <Button
        {...props}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          if (node) {
            event.preventDefault();
            return;
          }
          event.stopPropagation();
          const resolvedActionType =
            actionType || (pageSlug ? "navigate" : "none");
          if (resolvedActionType === "openPopup" && popupId && onOpenPopup) {
            onOpenPopup(popupId);
            return;
          }
          if (
            resolvedActionType === "navigate" &&
            pageSlug &&
            onNavigateToPageSlug
          ) {
            onNavigateToPageSlug(pageSlug);
            return;
          }
          onClick?.(event);
        }}
      />
    ),
    defaultProps: withDefaultVerticalMargins({
      children: "Button",
      variant: "contained",
      className: "",
      icon: "",
      iconPos: "start",
      actionType: "none",
      pageSlug: "",
      popupId: "",
    }),
  },
  Link: {
    name: "Link",
    category: "basic",
    icon: LinkIcon,
    component: ({ node, ...props }: any) => (
      <LinkNode {...props} isDesignMode={Boolean(node)} />
    ),
    defaultProps: withDefaultVerticalMargins({
      children: "Link",
      className: "",
      linkType: "internal",
      pageSlug: "/",
      externalUrl: "",
      openInNewTab: true,
      underline: "hover",
      color: "primary",
      enableHoverMenu: false,
      hoverMenuLayout: "dropdown",
      hoverMenuColumns: 3,
      hoverMenuMinWidth: 640,
      hoverMenuItems: [],
    }),
  },
  Input: {
    name: "Input",
    category: "input",
    icon: InputIcon,
    component: ({
      label,
      type,
      labelColor,
      regexPattern: _unusedRegexPattern,
      regexValidationTrigger: _unusedRegexValidationTrigger,
      regexErrorMessage: _unusedRegexErrorMessage,
      fullWidth: _unusedFullWidth,
      className,
      style,
      ...props
    }: any) => {
      const { wrapperClassName, inputClassName } = splitMarginClasses(className);
      const { wrapperStyle, inputStyle } = splitMarginStyle(style);

      return (
        <div
          className={`flex flex-col gap-1 w-full ${wrapperClassName}`.trim()}
          style={wrapperStyle}
        >
          {label && (
            <label
              className="text-sm font-medium text-gray-700"
              style={labelColor ? { color: labelColor } : undefined}
            >
              {label}
            </label>
          )}
          <Input
            {...props}
            className={inputClassName}
            style={inputStyle}
            type={type || "text"}
            fullWidth
          />
        </div>
      );
    },
    defaultProps: withDefaultVerticalMargins({
      label: "Input Label",
      labelColor: "#374151",
      type: "text",
      placeholder: "Enter text...",
      disableBorder: false,
      required: false,
      name: "",
      regexPattern: "",
      regexValidationTrigger: "onSubmit",
      regexErrorMessage: "",
      className: "",
    }),
  },
  Text: {
    name: "Text",
    category: "basic",
    icon: TextIcon,
    component: Typography,
    defaultProps: withDefaultVerticalMargins({
      children: "Double click to edit text",
      variant: "inherit",
      className: "text-base text-gray-800",
    }),
  },
  Select: {
    name: "Select",
    category: "input",
    icon: SelectIcon,
    component: ({ options, fullWidth: _unusedFullWidth, ...props }: any) => (
      <Select {...props} options={options || []} fullWidth />
    ),
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Select Option",
      className: "",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ],
    }),
  },
  Checkbox: {
    name: "Checkbox",
    category: "input",
    icon: CheckboxIcon,
    component: Checkbox,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Check me",
      fullWidth: true,
    }),
  },
  Switch: {
    name: "Switch",
    category: "input",
    icon: SwitchIcon,
    component: SwitchUI,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Enable option",
      checked: false,
      size: "medium",
      className: "",
    }),
  },
  RadioGroup: {
    name: "RadioGroup",
    category: "input",
    icon: SelectIcon,
    component: ({ options, ...props }: any) => (
      <RadioGroupUI {...props} options={options || []} />
    ),
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Choose an option",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ],
      value: "",
      row: false,
      className: "",
    }),
  },
  Rating: {
    name: "Rating",
    category: "input",
    icon: RatingIcon,
    component: (props: any) => <RatingUI {...props} />,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Rate this",
      value: 3,
      max: 5,
      precision: 1,
      readOnly: false,
      size: "medium",
      className: "",
    }),
  },
  Image: {
    name: "Image",
    category: "basic",
    icon: BoxIcon,
    component: ({ src, alt, className, ...props }: any) => (
      <img
        src={src || "https://placehold.co/150"}
        alt={alt || "placeholder"}
        className={`max-w-full ${className || ""}`}
        {...props}
      />
    ),
    defaultProps: withDefaultVerticalMargins({}),
  },
  Textarea: {
    name: "Textarea",
    category: "input",
    icon: TextIcon,
    component: ({ className, ...props }: any) => (
      <textarea {...props} className={className || "border p-2 rounded"} />
    ),
    defaultProps: withDefaultVerticalMargins({
      placeholder: "Enter long text...",
      className: "",
    }),
  },
  DataGrid: {
    name: "DataGrid",
    category: "data",
    icon: TableIcon,
    component: DataGrid,
    defaultProps: withDefaultVerticalMargins({
      className: "",
      apiUrl: "",
      columns: [
        { field: "id", headerName: "ID", width: 70 },
        { field: "firstName", headerName: "First name", width: 130 },
        { field: "lastName", headerName: "Last name", width: 130 },
      ],
      style: { width: "100%", height: "400px" },
    }),
  },
  Charts: {
    name: "Charts",
    category: "data",
    icon: ChartIcon,
    component: Charts,
    defaultProps: withDefaultVerticalMargins({
      chartType: "bar",
      title: "Sales Overview",
      dataSource: "manual",
      apiUrl: "",
      jsonData: "",
      dataPath: "",
      xAxisKey: "",
      yAxisKey: "",
      colorKey: "",
      labels: ["Jan", "Feb", "Mar", "Apr"],
      values: [12, 19, 8, 15],
      height: 320,
      showLegend: true,
      showGrid: true,
      color: "#1976d2",
      pointColors: ["#1976d2", "#2e7d32", "#ed6c02", "#9c27b0"],
      lineCurve: "monotoneX",
      xAxisLabel: "",
      yAxisLabel: "",
      pieInnerRadius: 0,
      className: "w-full",
    }),
  },
  MaterialIcon: {
    name: "MaterialIcon",
    category: "basic",
    icon: StarIcon,
    component: MaterialIcon,
    defaultProps: withDefaultVerticalMargins({
      icon: "home",
      className: "text-gray-800 text-4xl",
      style: { fontSize: "40px" },
    }),
  },
  DatePicker: {
    name: "DatePicker",
    category: "input",
    icon: CalendarIcon,
    component: DatePicker,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Select Date",
      className: "",
      helperText: "",
    }),
  },
  TimePicker: {
    name: "TimePicker",
    category: "input",
    icon: TimePickerIcon,
    component: TimePicker,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Select Time",
      className: "",
      helperText: "",
    }),
  },
  DateTimePicker: {
    name: "DateTimePicker",
    category: "input",
    icon: CalendarIcon,
    component: DateTimePicker,
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Select Date & Time",
      className: "",
      helperText: "",
    }),
  },
  MultiSelect: {
    name: "MultiSelect",
    category: "input",
    icon: SelectIcon,
    component: ({ options, fullWidth: _unusedFullWidth, ...props }: any) => (
      <MultiSelect {...props} options={options || []} fullWidth />
    ),
    defaultProps: withDefaultVerticalMargins({
      caption: "",
      label: "Multi Select",
      className: "",
      options: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
      ],
      value: [],
    }),
  },
  Tabs: {
    name: "Tabs",
    category: "layout",
    icon: ContainerIcon,
    component: Tabs,
    defaultProps: withDefaultVerticalMargins({
      items: [
        { label: "Tab 1", id: "tab1" },
        { label: "Tab 2", id: "tab2" },
      ],
      defaultValue: 0,
      className: "",
    }),
  },
  Stepper: {
    name: "Stepper",
    category: "layout",
    icon: StepperIcon,
    component: Stepper,
    defaultProps: withDefaultVerticalMargins({
      steps: [
        { label: "Select campaign settings", optional: false },
        { label: "Create an ad group", optional: true },
        { label: "Create an ad", optional: false },
      ],
      activeStep: 1,
      orientation: "horizontal",
      linear: true,
      alternativeLabel: true,
      showControls: true,
      showStatusText: true,
      stepPrefixText: "Step",
      completedText: "All steps completed - you're finished",
      backLabel: "BACK",
      nextLabel: "NEXT",
      skipLabel: "SKIP",
      finishLabel: "FINISH",
      resetLabel: "RESET",
      className: "w-full",
    }),
  },
};
