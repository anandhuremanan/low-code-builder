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

const PAGE_PLAN_GUIDANCE = `
Return a single JSON object with this shape:
{
  "pagePlan": {
    "name": "Page Name",
    "slug": "/page-slug",
    "style": "saas" | "editorial" | "minimal" | "bold",
    "sections": [
      {
        "type": "hero" | "feature-grid" | "stats" | "testimonial-grid" | "pricing" | "faq" | "cta-banner" | "contact-form" | "content",
        "heading": "Section heading",
        "body": "Section supporting copy",
        "layout": "centered" | "split",
        "primaryAction": { "label": "Button text" },
        "secondaryAction": { "label": "Button text" },
        "items": [
          {
            "title": "Card title",
            "description": "Card description",
            "meta": "Optional short meta",
            "value": "Optional metric or price",
            "bullets": ["Optional bullet", "Optional bullet"]
          }
        ],
        "formFields": [
          {
            "type": "text" | "email" | "tel" | "number" | "textarea",
            "label": "Field label",
            "placeholder": "Field placeholder",
            "required": true,
            "name": "field-name"
          }
        ]
      }
    ]
  }
}

Rules:
- Return JSON only. No markdown fences, no prose, no comments.
- Prefer 4 to 6 sections total.
- Always include a "hero" section first.
- Use coherent marketing-page structure. Good combinations are:
  hero -> stats -> feature-grid -> testimonial-grid -> pricing -> cta-banner
  hero -> content -> feature-grid -> faq -> contact-form
- Keep content concise and realistic.
- Do not invent raw builder nodes.
- Use "split" hero only when supporting cards/items are useful.
- Use at most 6 items per section and 6 form fields.
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
${PAGE_PLAN_GUIDANCE}

Task: create an improved page plan for the existing page based on the user's requested changes.
The current page JSON is provided only as context so you can understand the current content and structure.
Return a fresh pagePlan, not raw builder nodes.

Current page JSON:
${JSON.stringify(currentPage, null, 2)}

Requested edits:
${prompt}
`.trim();
  }

  return `
${PAGE_PLAN_GUIDANCE}

Task: generate a high-quality page plan from this prompt:
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
              "You are a UI planner. Produce only structured JSON page plans for polished, modern pages. Avoid generic filler and avoid raw builder-node output.",
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
