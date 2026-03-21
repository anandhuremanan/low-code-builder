import { type ActionFunctionArgs } from "react-router";
import { type Page } from "../builder/types";

type BuilderMode = "generate" | "edit";

type RequestPayload = {
  mode?: BuilderMode;
  prompt?: string;
  currentPage?: Pick<Page, "name" | "slug" | "nodes"> | null;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const SUPPORTED_COMPONENTS = [
  "Container",
  "Form",
  "Button",
  "Link",
  "Input",
  "Text",
  "Image",
  "Select",
  "Checkbox",
  "Switch",
  "Textarea",
  "DataGrid",
  "MaterialIcon",
  "DatePicker",
  "TimePicker",
  "DateTimePicker",
  "MultiSelect",
  "Charts",
  "Tabs",
  "Stepper",
  "RadioGroup",
  "Rating",
].join(", ");

const COMPONENT_GUIDANCE = `
Supported component types: ${SUPPORTED_COMPONENTS}

Return a single JSON object with this shape:
{
  "name": "Page Name",
  "slug": "/page-slug",
  "nodes": [
    {
      "id": "root-container",
      "type": "Container",
      "props": {
        "className": "min-h-screen p-8 bg-white"
      },
      "children": []
    }
  ]
}

Rules:
- Return JSON only. No markdown fences, no prose, no comments.
- The first node must be a Container with id "root-container".
- Every node must have: id, type, props, children.
- children must always be an array.
- Use only the supported component types.
- Prefer builder-safe props such as className, style, children, label, placeholder, options, variant, src, alt, name, required, caption.
- Text content should use Text components with props.children as a string.
- Layout should be composed primarily with nested Container nodes and className strings.
- Forms should use a Form node with form fields as children.
- Buttons can be included when the page needs call-to-actions.
- Keep ids descriptive and unique.
- Keep output practical for drag-and-drop editing in a visual builder.
`;

const extractJson = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
};

const createUserPrompt = (
  mode: BuilderMode,
  prompt: string,
  currentPage?: Pick<Page, "name" | "slug" | "nodes"> | null,
): string => {
  if (mode === "edit" && currentPage) {
    return `
${COMPONENT_GUIDANCE}

Task: modify the existing builder page JSON based on the user's requested changes.
Preserve existing ids whenever the corresponding nodes still exist so drag-and-drop editing remains stable.
Only remove or regenerate ids for brand-new nodes.

Current page JSON:
${JSON.stringify(currentPage, null, 2)}

Requested edits:
${prompt}
`.trim();
  }

  return `
${COMPONENT_GUIDANCE}

Task: generate a complete builder page JSON from this prompt:
${prompt}
`.trim();
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.IPA_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing GROQ_API_KEY or IPA_KEY environment variable." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as RequestPayload;
    const mode: BuilderMode = body.mode === "edit" ? "edit" : "generate";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return Response.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (mode === "edit" && !body.currentPage) {
      return Response.json(
        { error: "Current page JSON is required for edit mode." },
        { status: 400 },
      );
    }

    const upstreamResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You convert product requests into strict JSON for a visual drag-and-drop page builder.",
          },
          {
            role: "user",
            content: createUserPrompt(mode, prompt, body.currentPage),
          },
        ],
      }),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return Response.json(
        { error: "Upstream AI request failed.", details: errorText },
        { status: 502 },
      );
    }

    const completion = (await upstreamResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: "No content returned from AI model." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(extractJson(content));
    return Response.json({ page: parsed });
  } catch (error) {
    console.error("AI builder route error", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
