import { COMPONENT_REGISTRY } from "./registry";
import { type ComponentNode, type ComponentType, type Page } from "./types";

type UnknownRecord = Record<string, unknown>;

export type AiPagePayload = {
  name?: string;
  slug?: string;
  nodes?: unknown;
};

const ROOT_CONTAINER_PROPS = {
  className: "min-h-screen p-8 bg-white",
};

const ALLOWED_COMPONENT_TYPES = new Set<ComponentType>(
  Object.keys(COMPONENT_REGISTRY) as ComponentType[],
);

const slugify = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `/${slug}` : "/generated-page";
};

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const createNodeId = (
  prefix: string,
  usedIds: Set<string>,
  fallback: string,
): string => {
  const base = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const seed = base || fallback;
  let candidate = `${seed}-${Math.random().toString(36).slice(2, 7)}`;

  while (usedIds.has(candidate)) {
    candidate = `${seed}-${Math.random().toString(36).slice(2, 7)}`;
  }

  usedIds.add(candidate);
  return candidate;
};

const normalizeNode = (
  rawNode: unknown,
  usedIds: Set<string>,
): ComponentNode | null => {
  if (!isRecord(rawNode)) return null;

  const rawType = rawNode.type;
  if (typeof rawType !== "string" || !ALLOWED_COMPONENT_TYPES.has(rawType as ComponentType)) {
    return null;
  }

  const type = rawType as ComponentType;
  const registryEntry = COMPONENT_REGISTRY[type];
  const rawProps = isRecord(rawNode.props) ? rawNode.props : {};
  const baseProps = cloneValue(registryEntry.defaultProps);
  const labelSeed =
    typeof rawProps.label === "string"
      ? rawProps.label
      : typeof rawProps.name === "string"
        ? rawProps.name
        : type;

  const preferredId =
    typeof rawNode.id === "string" && rawNode.id.trim().length > 0
      ? rawNode.id.trim()
      : createNodeId(labelSeed, usedIds, type.toLowerCase());

  const id = usedIds.has(preferredId)
    ? createNodeId(labelSeed, usedIds, type.toLowerCase())
    : preferredId;

  usedIds.add(id);

  const children = Array.isArray(rawNode.children)
    ? rawNode.children
        .map((child) => normalizeNode(child, usedIds))
        .filter((child): child is ComponentNode => child !== null)
    : [];

  return {
    id,
    type,
    props: {
      ...baseProps,
      ...cloneValue(rawProps),
    },
    children,
  };
};

export const normalizeAiPagePayload = (
  rawPayload: unknown,
  currentPage?: Page | null,
): Required<Pick<Page, "name" | "slug" | "nodes">> => {
  const payload = isRecord(rawPayload) ? rawPayload : {};
  const usedIds = new Set<string>();
  const currentPageName = currentPage?.name || "Generated Page";
  const name =
    typeof payload.name === "string" && payload.name.trim().length > 0
      ? payload.name.trim()
      : currentPageName;
  const slug =
    typeof payload.slug === "string" && payload.slug.trim().length > 0
      ? payload.slug.trim().startsWith("/")
        ? payload.slug.trim()
        : `/${payload.slug.trim()}`
      : currentPage?.slug || slugify(name);

  let normalizedNodes = Array.isArray(payload.nodes)
    ? payload.nodes
        .map((node) => normalizeNode(node, usedIds))
        .filter((node): node is ComponentNode => node !== null)
    : [];

  const firstNode = normalizedNodes[0];
  if (!firstNode || firstNode.id !== "root-container" || firstNode.type !== "Container") {
    normalizedNodes = [
      {
        id: "root-container",
        type: "Container",
        props: {
          ...ROOT_CONTAINER_PROPS,
          ...(firstNode?.type === "Container" ? firstNode.props : {}),
        },
        children:
          firstNode?.id === "root-container" && firstNode.type === "Container"
            ? firstNode.children
            : normalizedNodes,
      },
    ];
  } else {
    normalizedNodes = [
      {
        ...firstNode,
        id: "root-container",
        props: {
          ...ROOT_CONTAINER_PROPS,
          ...firstNode.props,
        },
      },
      ...normalizedNodes.slice(1),
    ];
  }

  return {
    name,
    slug,
    nodes: normalizedNodes,
  };
};
