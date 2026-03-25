import { COMPONENT_REGISTRY } from "./registry";
import { type ComponentNode, type ComponentType, type Page } from "./types";

type SectionType =
  | "hero"
  | "feature-grid"
  | "stats"
  | "testimonial-grid"
  | "pricing"
  | "faq"
  | "cta-banner"
  | "contact-form"
  | "content"
  | "auth-form"
  | "kpi-grid"
  | "chart-grid"
  | "data-table";

type PlanTheme = "saas" | "editorial" | "minimal" | "bold";
type PageType = "landing" | "auth" | "dashboard" | "content";

type PlanItem = {
  title?: string;
  description?: string;
  meta?: string;
  value?: string;
  bullets?: string[];
  chartType?: "bar" | "line" | "pie" | "area";
  labels?: string[];
  values?: number[];
};

type PlanField = {
  type?: "text" | "email" | "tel" | "number" | "textarea";
  label?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
};

type PlanSection = {
  type?: SectionType;
  heading?: string;
  body?: string;
  layout?: "centered" | "split";
  items?: PlanItem[];
  formFields?: PlanField[];
  primaryAction?: { label?: string };
  secondaryAction?: { label?: string };
};

export type AiPagePlan = {
  name?: string;
  slug?: string;
  pageType?: PageType;
  style?: PlanTheme;
  sections?: PlanSection[];
};

const slugify = (value: string) =>
  `/${value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "generated-page"}`;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const str = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;
const arr = <T,>(value: T[] | undefined) => (Array.isArray(value) ? value : []);
const numArr = (value: unknown): number[] =>
  Array.isArray(value) ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item)) : [];
const strArr = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean) : [];

const themeMap: Record<PlanTheme, Record<string, string>> = {
  saas: {
    root: "min-h-screen bg-slate-950",
    shell: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10",
    section: "rounded-[28px] border border-slate-800 bg-slate-900 px-6 py-10 md:px-10",
    card: "rounded-3xl border border-slate-700 bg-slate-800 p-6",
    title: "text-4xl md:text-5xl font-semibold tracking-tight text-white",
    body: "text-base leading-7 text-slate-300",
    sub: "text-sm text-slate-400",
    cardTitle: "text-lg font-semibold text-white",
    sectionTitle: "text-3xl font-semibold text-white",
    buttonPrimary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    buttonSecondary: "border border-slate-600 bg-transparent text-white hover:bg-slate-800",
  },
  editorial: {
    root: "min-h-screen bg-stone-100",
    shell: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10",
    section: "rounded-[28px] border border-stone-300 bg-white px-6 py-10 md:px-10",
    card: "rounded-3xl border border-stone-300 bg-stone-50 p-6",
    title: "text-4xl md:text-5xl font-semibold tracking-tight text-stone-900",
    body: "text-base leading-7 text-stone-600",
    sub: "text-sm text-stone-500",
    cardTitle: "text-lg font-semibold text-stone-900",
    sectionTitle: "text-3xl font-semibold text-stone-900",
    buttonPrimary: "bg-stone-900 text-white hover:bg-stone-800",
    buttonSecondary: "border border-stone-300 bg-white text-stone-900 hover:bg-stone-100",
  },
  minimal: {
    root: "min-h-screen bg-slate-50",
    shell: "mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8 md:px-10",
    section: "rounded-[24px] border border-slate-200 bg-white px-6 py-10 md:px-10",
    card: "rounded-2xl border border-slate-200 bg-slate-50 p-5",
    title: "text-4xl md:text-5xl font-semibold tracking-tight text-slate-900",
    body: "text-base leading-7 text-slate-600",
    sub: "text-sm text-slate-500",
    cardTitle: "text-lg font-semibold text-slate-900",
    sectionTitle: "text-3xl font-semibold text-slate-900",
    buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800",
    buttonSecondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  },
  bold: {
    root: "min-h-screen bg-orange-50",
    shell: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10",
    section: "rounded-[28px] border border-orange-200 bg-white px-6 py-10 md:px-10",
    card: "rounded-3xl border border-orange-200 bg-orange-100/60 p-6",
    title: "text-4xl md:text-5xl font-black tracking-tight text-slate-950",
    body: "text-base leading-7 text-slate-700",
    sub: "text-sm text-slate-600",
    cardTitle: "text-lg font-semibold text-slate-950",
    sectionTitle: "text-3xl font-semibold text-slate-950",
    buttonPrimary: "bg-orange-500 text-white hover:bg-orange-400",
    buttonSecondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  },
};

export const buildPageFromPlan = (
  rawPlan: unknown,
  currentPage?: Page | null,
): Required<Pick<Page, "name" | "slug" | "nodes">> => {
  const plan = isRecord(rawPlan) ? (rawPlan as AiPagePlan) : {};
  const theme = themeMap[plan.style || "saas"];
  const pageType = plan.pageType || "landing";
  const usedIds = new Set<string>();
  const node = (type: ComponentType, prefix: string, props: Record<string, unknown>, children: ComponentNode[] = []): ComponentNode => {
    let id = `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
    while (usedIds.has(id)) id = `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
    usedIds.add(id);
    return { id, type, props: { ...clone(COMPONENT_REGISTRY[type].defaultProps), ...props }, children };
  };
  const text = (prefix: string, children: string, className: string) => node("Text", prefix, { children, className });
  const card = (prefix: string, children: ComponentNode[]) => node("Container", prefix, { className: theme.card }, children);
  const button = (prefix: string, label: string, secondary = false) =>
    node("Button", prefix, {
      children: label,
      variant: secondary ? "outlined" : "contained",
      className: `rounded-full px-5 py-3 text-sm font-semibold ${secondary ? theme.buttonSecondary : theme.buttonPrimary}`,
    });
  const parseMetricValue = (value: string | undefined, fallback: number[]) => {
    if (!value) return fallback;
    const numericTokens = value.match(/-?\d+(\.\d+)?/g);
    if (!numericTokens?.length) return fallback;
    const parsed = numericTokens.map((token) => Number(token)).filter((item) => Number.isFinite(item));
    return parsed.length ? parsed : fallback;
  };

  const mapSection = (section: PlanSection, index: number): ComponentNode => {
    const heading = str(section.heading, `Section ${index + 1}`);
    const body = str(section.body, "Add supporting content here.");
    const items = arr(section.items).slice(0, 6);
    const cards = items.map((item, itemIndex) =>
      card(`card-${index + 1}-${itemIndex + 1}`, [
        text(`card-title-${index + 1}-${itemIndex + 1}`, str(item.title, `Item ${itemIndex + 1}`), theme.cardTitle),
        text(`card-body-${index + 1}-${itemIndex + 1}`, str(item.description, "Supporting description."), theme.body),
        ...(item.value ? [text(`card-value-${index + 1}-${itemIndex + 1}`, item.value, "mt-2 text-3xl font-semibold text-cyan-300")] : []),
        ...(item.meta ? [text(`card-meta-${index + 1}-${itemIndex + 1}`, item.meta, theme.sub)] : []),
        ...arr(item.bullets).slice(0, 4).map((bullet, bulletIndex) =>
          text(`card-bullet-${index + 1}-${itemIndex + 1}-${bulletIndex + 1}`, `• ${bullet}`, theme.sub),
        ),
      ]),
    );

    const top = node("Container", `section-head-${index + 1}`, { className: "mb-8 flex max-w-2xl flex-col gap-3" }, [
      text(`section-title-${index + 1}`, heading, section.type === "hero" ? theme.title : theme.sectionTitle),
      text(`section-body-${index + 1}`, body, theme.body),
    ]);

    if (section.type === "auth-form") {
      const fields = (arr(section.formFields).length ? arr(section.formFields) : [
        { type: "email", label: "Email Address", placeholder: "name@example.com", required: true, name: "email" },
        { type: "text", label: "Password", placeholder: "Enter your password", required: true, name: "password" },
      ])
        .slice(0, 6)
        .map((field, fieldIndex) => {
          const name = str(field.name || field.label, `field-${fieldIndex + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const type = field.type === "textarea" ? "text" : field.type === "number" || field.type === "tel" || field.type === "email" ? field.type : "text";
          return node("Input", `auth-input-${index + 1}-${fieldIndex + 1}`, {
            label: str(field.label, `Field ${fieldIndex + 1}`),
            name,
            type,
            placeholder: str(field.placeholder, `Enter ${str(field.label, `field ${fieldIndex + 1}`)}`),
            required: Boolean(field.required),
            className: "w-full",
          });
        });

      return node("Container", `section-${index + 1}`, { className: "mx-auto w-full max-w-5xl" }, [
        node("Container", `auth-shell-${index + 1}`, { className: `${theme.section} mx-auto grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center` }, [
          node("Container", `auth-copy-${index + 1}`, { className: "flex flex-col gap-4" }, [
            text(`auth-title-${index + 1}`, heading, theme.title),
            text(`auth-body-${index + 1}`, body, theme.body),
            ...(section.secondaryAction?.label ? [text(`auth-helper-${index + 1}`, section.secondaryAction.label, theme.sub)] : []),
          ]),
          node("Form", `auth-form-${index + 1}`, {
            className: `${theme.card} w-full`,
            showSubmitButton: true,
            submitButtonText: str(section.primaryAction?.label, "Continue"),
            submitButtonVariant: "contained",
          }, fields),
        ]),
      ]);
    }

    if (section.type === "hero") {
      const actions = node("Container", `hero-actions-${index + 1}`, { className: `flex flex-wrap gap-3 ${section.layout === "centered" ? "justify-center" : ""}` }, [
        button(`hero-primary-${index + 1}`, str(section.primaryAction?.label, "Get Started")),
        button(`hero-secondary-${index + 1}`, str(section.secondaryAction?.label, "Learn More"), true),
      ]);
      const left = node("Container", `hero-copy-${index + 1}`, { className: `flex flex-col gap-5 ${section.layout === "split" ? "max-w-2xl" : "mx-auto max-w-3xl items-center text-center"}` }, [top, actions]);
      const right = cards.length ? node("Container", `hero-grid-${index + 1}`, { className: "grid gap-3 md:grid-cols-2" }, cards.slice(0, 4)) : card(`hero-card-${index + 1}`, [text(`hero-card-title-${index + 1}`, "Fast setup", theme.cardTitle), text(`hero-card-body-${index + 1}`, "Generated with a constrained section plan instead of raw node dumping.", theme.body)]);
      return node("Container", `section-${index + 1}`, { className: `${theme.section} ${section.layout === "centered" ? "py-14" : ""}` }, [
        node("Container", `hero-layout-${index + 1}`, { className: section.layout === "split" ? "grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center" : "flex flex-col" }, section.layout === "split" ? [left, right] : [left]),
      ]);
    }

    if (section.type === "cta-banner") {
      return node("Container", `section-${index + 1}`, { className: `${theme.section} bg-gradient-to-r from-slate-900 to-slate-800` }, [
        node("Container", `cta-layout-${index + 1}`, { className: "flex flex-col gap-5 md:flex-row md:items-center md:justify-between" }, [
          top,
          node("Container", `cta-actions-${index + 1}`, { className: "flex flex-wrap gap-3" }, [
            button(`cta-primary-${index + 1}`, str(section.primaryAction?.label, "Start Now")),
            button(`cta-secondary-${index + 1}`, str(section.secondaryAction?.label, "See Demo"), true),
          ]),
        ]),
      ]);
    }

    if (section.type === "chart-grid") {
      const charts = items.length
        ? items.map((item, itemIndex) => {
            const labels = strArr(item.labels);
            const fallbackValues = parseMetricValue(item.value, [18, 26, 20, 32]);
            const values = numArr(item.values).length ? numArr(item.values) : fallbackValues;
            const chartLabels = labels.length ? labels : values.map((_, valueIndex) => `Item ${valueIndex + 1}`);
            return node("Container", `chart-card-${index + 1}-${itemIndex + 1}`, { className: theme.card }, [
              text(`chart-title-${index + 1}-${itemIndex + 1}`, str(item.title, `Chart ${itemIndex + 1}`), theme.cardTitle),
              ...(item.description ? [text(`chart-body-${index + 1}-${itemIndex + 1}`, item.description, theme.body)] : []),
              node("Charts", `chart-${index + 1}-${itemIndex + 1}`, {
                chartType: item.chartType || "bar",
                title: str(item.title, `Chart ${itemIndex + 1}`),
                labels: chartLabels,
                values,
                className: "w-full",
                height: 280,
                showLegend: true,
                showGrid: true,
              }),
            ]);
          })
        : [card(`chart-fallback-${index + 1}`, [
            text(`chart-fallback-title-${index + 1}`, "Performance", theme.cardTitle),
            node("Charts", `chart-fallback-node-${index + 1}`, {
              chartType: "bar",
              title: "Performance",
              labels: ["Mon", "Tue", "Wed", "Thu"],
              values: [12, 18, 15, 24],
              className: "w-full",
              height: 280,
              showLegend: true,
              showGrid: true,
            }),
          ])];

      return node("Container", `section-${index + 1}`, { className: theme.section }, [
        top,
        node("Container", `chart-grid-${index + 1}`, { className: "grid gap-4 xl:grid-cols-2" }, charts),
      ]);
    }

    if (section.type === "data-table") {
      const columns = items.length
        ? items.map((item, itemIndex) => ({
            field: str(item.title, `column-${itemIndex + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "_"),
            headerName: str(item.title, `Column ${itemIndex + 1}`),
            width: 180,
          }))
        : [
            { field: "name", headerName: "Name", width: 180 },
            { field: "status", headerName: "Status", width: 140 },
            { field: "owner", headerName: "Owner", width: 160 },
          ];

      return node("Container", `section-${index + 1}`, { className: theme.section }, [
        top,
        node("DataGrid", `table-${index + 1}`, {
          className: "w-full",
          columns,
          style: { width: "100%", height: "420px" },
        }),
      ]);
    }

    if (section.type === "contact-form") {
      const fields = arr(section.formFields).slice(0, 6).map((field, fieldIndex) => {
        const name = str(field.name || field.label, `field-${fieldIndex + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return field.type === "textarea"
          ? node("Textarea", `textarea-${index + 1}-${fieldIndex + 1}`, { label: str(field.label, `Field ${fieldIndex + 1}`), name, placeholder: str(field.placeholder, "Enter your message"), className: "min-h-[120px] w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900" })
          : node("Input", `input-${index + 1}-${fieldIndex + 1}`, { label: str(field.label, `Field ${fieldIndex + 1}`), name, type: field.type || "text", placeholder: str(field.placeholder, `Enter ${str(field.label, `field ${fieldIndex + 1}`)}`), required: Boolean(field.required) });
      });
      return node("Container", `section-${index + 1}`, { className: theme.section }, [
        node("Container", `contact-layout-${index + 1}`, { className: "grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-start" }, [
          top,
          node("Form", `contact-form-${index + 1}`, { className: `${theme.card} border border-slate-700`, showSubmitButton: true, submitButtonText: str(section.primaryAction?.label, "Submit"), submitButtonVariant: "contained" }, fields),
        ]),
      ]);
    }

    return node("Container", `section-${index + 1}`, { className: theme.section }, [
      top,
      node("Container", `section-grid-${index + 1}`, { className: section.type === "stats" || section.type === "kpi-grid" ? "grid gap-4 md:grid-cols-3" : section.type === "faq" ? "grid gap-4" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3" }, cards.length ? cards : [card(`fallback-card-${index + 1}`, [text(`fallback-title-${index + 1}`, "Add content", theme.cardTitle), text(`fallback-body-${index + 1}`, "The model did not provide section items.", theme.body)])]),
    ]);
  };

  const name = str(plan.name, currentPage?.name || "Generated Page");
  const slug = str(plan.slug, currentPage?.slug || slugify(name));
  const sections = arr(plan.sections).slice(0, 8);
  const children = sections.length
    ? sections.map(mapSection)
    : [node("Container", "section-fallback", { className: theme.section }, [text("fallback-title", name, theme.title), text("fallback-body", "Use a more specific prompt to generate a richer page plan.", theme.body)])];

  return {
    name,
    slug: slug.startsWith("/") ? slug : `/${slug}`,
    nodes: [
      {
        id: "root-container",
        type: "Container",
        props: {
          className: `${theme.root} ${pageType === "auth" ? "flex items-center justify-center" : ""}`,
          style: {
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            ...(pageType === "auth" ? { justifyContent: "center" } : {}),
          },
        },
        children: [node("Container", "page-shell", {
          className: pageType === "auth"
            ? "mx-auto flex w-full max-w-6xl flex-col px-6 py-10 md:px-10"
            : theme.shell,
          style: {
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
          },
        }, children)],
      },
    ],
  };
};
