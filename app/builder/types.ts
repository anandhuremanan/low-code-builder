import { type ReactNode } from "react";
import * as LucideIcons from "lucide-react";

export type ComponentType =
  | "Container"
  | "Header"
  | "Footer"
  | "Button"
  | "Input"
  | "Text"
  | "Image"
  | "Select"
  | "Checkbox"
  | "Switch"
  | "Textarea"
  | "DataGrid"
  | "MaterialIcon"
  | "DatePicker"
  | "TimePicker"
  | "DateTimePicker"
  | "MultiSelect"
  | "Tabs"
  | "Stepper"
  | "Group"
  | "RadioGroup"
  | "Rating";

export type ComponentNode = {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children: ComponentNode[];
  parentId?: string;
  // Style properties could be separate or part of props, keeping it simple for now
  style?: Record<string, any>;
};

export type Page = {
  id: string;
  name: string;
  slug: string;
  nodes: ComponentNode[];
};

export type CustomStyle = {
  id: string;
  name: string;
  className: string;
  css: string;
};

export type RegisteredComponent = {
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  hidden?: boolean; // For internal components like Root
};

export type DragItem = {
  id: string;
  type: ComponentType;
  isNew?: boolean; // If true, it's being dragged from the sidebar
};
