import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to replace specific Tailwind classes in a string
export const updateClass = (
  currentClass: string,
  prefix: string,
  newValue: string,
  exactMatch: boolean = false,
): string => {
  if (!currentClass) return newValue;

  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // If exactMatch is true, we only match if the class is EXACTLY the prefix + value
  // This is useful for things like 'border' vs 'border-2' if we treat 'border' as a prefix for 'border'
  // But mostly we rely on the prefix including the hyphen if needed.

  // Regex to match:
  // 1. Start of string or whitespace
  // 2. The prefix
  // 3. The value (alphanumeric, dashes, dots, slash, or arbitrary square brackets)
  // 4. End of string or whitespace

  // Refined regex to be less greedy if we want specific behavior,
  // but for general use:
  const regex = new RegExp(
    `(^|\\s)${escapedPrefix}(?:-?)([^\\s]*?)($|\\s)`,
    "g",
  );

  // However, the original regex was better for standard `prefix-value` patterns.
  // Let's use a smarter one that handles the "border" edge case (border width vs color).

  let regexPattern = `(^|\\s)${escapedPrefix}([\\w-./]+|\\[[^[\\]]+\\])($|\\s)`;

  // Special handling for border width to avoid matching border-red-500 or border-solid
  if (prefix === "border-") {
    // match border-2, border-[3px], but NOT border-red-*, border-solid, etc.
    // actually border width can also be just 'border' (1px).
    // simpler strategy: callers should pass specific prefixes for color/style vs width.
    // logic moved to component? No, let's keep it simple here.
  }

  const finalRegex = new RegExp(regexPattern, "g");

  const cleaned = currentClass.replace(finalRegex, "$1").trim();

  // If newValue is empty (removing the style), just return cleaned
  if (!newValue) return cleaned;

  return twMerge(cleaned, newValue);
};

export const getTailwindValue = (
  currentClass: string,
  prefix: string,
): string => {
  if (!currentClass) return "";
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(?:^|\\s)${escapedPrefix}([\\w-./]+|\\[[^[\\]]+\\])(?:$|\\s)`,
  );
  const match = currentClass.match(regex);
  if (match) {
    return prefix + match[1];
  }
  return "";
};

export const getBorderValue = (
  className: string,
  type: "width" | "color" | "style" | "radius",
): string => {
  if (!className) return "";

  // Radius: rounded-*
  if (type === "radius") {
    const match = className.match(
      /(?:^|\s)(rounded(?:-[trblxy]?[trblxy]?)?(?:-[^ ]+)?)(?:$|\s)/,
    );
    return match ? match[1] : "";
  }

  // Style: border-solid, border-dashed, etc.
  if (type === "style") {
    const match = className.match(
      /(?:^|\s)(border-(?:solid|dashed|dotted|double|hidden|none))(?:$|\s)/,
    );
    return match ? match[1] : "";
  }

  // Width: border, border-2, border-[...]. EXCLUDING color/style.
  // This is tricky because 'border-red-500' starts with 'border-'.
  // We look for border followed by digit or [
  if (type === "width") {
    // explicit border widths
    const match = className.match(
      /(?:^|\s)(border(?:-(?:[0-9]+|\[[^\]]+\]))?)(?:$|\s)/,
    );
    // Filter out if it matches a color format roughly?
    // actually `border-2` matches. `border-red` does not match `border-[0-9]`.
    // `border` matches.
    if (match) {
      // check if it's actually a color or style?
      // simplified: we assume if it matches border-2 or border or border-[..] it IS width.
      // border-red-500 does NOT match border-[0-9].
      return match[1];
    }
    return "";
  }

  // Color: border-{color}-{shade} or border-[#...]
  if (type === "color") {
    // match border- followed by NOT a number, NOT [number...], NOT solid/dashed
    // easiest: match all 'border-*' and filter?
    const tokens = className.split(/\s+/);
    const color = tokens.find(
      (t) =>
        t.startsWith("border-") &&
        !/^(border-(?:solid|dashed|dotted|double|hidden|none|[0-9]+|\[\d+.*\]))$/.test(
          t,
        ),
    );
    return color || "";
  }

  return "";
};

export const updateBorderClass = (
  className: string,
  type: "width" | "color" | "style" | "radius",
  newValue: string,
): string => {
  // First remove existing of that type
  let cleaned = className;

  if (type === "radius") {
    cleaned = cleaned.replace(
      /(?:^|\s)(rounded(?:-[trblxy]?[trblxy]?)?(?:-[^ ]+)?)(?:$|\s)/g,
      " ",
    );
  } else if (type === "style") {
    cleaned = cleaned.replace(
      /(?:^|\s)(border-(?:solid|dashed|dotted|double|hidden|none))(?:$|\s)/g,
      " ",
    );
  } else if (type === "width") {
    // clear border, border-2, border-[...]
    cleaned = cleaned.replace(
      /(?:^|\s)(border(?:-(?:[0-9]+|\[[^\]]+\]))?)(?:$|\s)/g,
      " ",
    );
  } else if (type === "color") {
    // clear regex for color
    cleaned = cleaned
      .split(/\s+/)
      .filter(
        (t) =>
          !(
            t.startsWith("border-") &&
            !/^(border-(?:solid|dashed|dotted|double|hidden|none|[0-9]+|\[\d+.*\]))$/.test(
              t,
            )
          ),
      )
      .join(" ");
  }

  return twMerge(cleaned, newValue);
};

export const getEffectValue = (
  className: string,
  type: "shadow" | "opacity",
): string => {
  if (!className) return "";

  if (type === "opacity") {
    const match = className.match(
      /(?:^|\s)(opacity-(?:[0-9]+|\[[^\]]+\]))(?:$|\s)/,
    );
    return match ? match[1] : "";
  }

  if (type === "shadow") {
    const match = className.match(
      /(?:^|\s)(shadow(?:-(?:sm|md|lg|xl|2xl|inner|none|[a-z]+))?)(?:$|\s)/,
    );
    return match ? match[1] : "";
  }

  return "";
};

export const updateEffectClass = (
  className: string,
  type: "shadow" | "opacity",
  newValue: string,
): string => {
  let cleaned = className;

  if (type === "opacity") {
    cleaned = cleaned.replace(
      /(?:^|\s)(opacity-(?:[0-9]+|\[[^\]]+\]))(?:$|\s)/g,
      " ",
    );
  } else if (type === "shadow") {
    cleaned = cleaned.replace(
      /(?:^|\s)(shadow(?:-(?:sm|md|lg|xl|2xl|inner|none|[a-z]+))?)(?:$|\s)/g,
      " ",
    );
  }

  return twMerge(cleaned, newValue);
};
