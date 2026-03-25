import type { CustomStyle, Page, Popup, SiteSections } from "../../../builder/types";

export const BUILDER_STATE_STORAGE_KEY = "builder-editor-state-v1";
export const PREVIEW_STORAGE_KEY = "builder-preview-site";

export type BuilderPreviewSnapshot = {
  pages: Page[];
  popups?: Popup[];
  currentPageId: string | null;
  currentPopupId?: string | null;
  viewMode?: "desktop" | "tablet" | "mobile";
  customStyles?: CustomStyle[];
  siteSections?: SiteSections;
};

type BuilderEditorSnapshot = {
  pages: Page[];
  popups: Popup[];
  currentPageId: string | null;
  currentPopupId: string | null;
  siteSections: SiteSections;
  editingTarget: string;
  selectedNodeId: string | null;
  draggedComponentType: string | null;
  viewMode: "desktop" | "tablet" | "mobile";
  customStyles: CustomStyle[];
};

const canUseStorage = () => typeof window !== "undefined";

export function loadBuilderEditorState(): Partial<BuilderEditorSnapshot> | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(BUILDER_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Partial<BuilderEditorSnapshot>;
  } catch {
    return null;
  }
}

export function saveBuilderEditorState(snapshot: BuilderEditorSnapshot) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(BUILDER_STATE_STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadPreviewSnapshot(): BuilderPreviewSnapshot | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.pages && Array.isArray(parsed.pages)) {
      return parsed as BuilderPreviewSnapshot;
    }

    if (parsed?.nodes) {
      const singlePage = parsed as Page;
      return {
        pages: [singlePage],
        currentPageId: singlePage.id,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function savePreviewSnapshot(snapshot: BuilderPreviewSnapshot) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(snapshot));
}
