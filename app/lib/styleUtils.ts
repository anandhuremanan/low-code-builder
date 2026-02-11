import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to replace specific Tailwind classes in a string
// This is a bit naive but works for standard classes.
// A more robust solution involves parsing, but for this builder demo:
export const updateClass = (
  currentClass: string,
  prefix: string,
  newValue: string,
): string => {
  if (!currentClass) return newValue;

  // Regex to find existing class with that prefix
  // e.g., p-4, p-[20px] -> prefix is 'p-'
  // text- -> text-center, text-left
  // w- -> w-full, w-1/2

  // Escape prefix for regex just in case
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Match standard classes (p-4) and arbitrary values (p-[10px])
  // This regex matches: (space or start)(prefix)(value or [value])(space or end)
  const regex = new RegExp(
    `(^|\\s)${escapedPrefix}([\\w-./]+|\\[[^[\\]]+\\])($|\\s)`,
    "g",
  );

  const cleaned = currentClass.replace(regex, "$1").trim();

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
    // Return the full class, e.g. "p-4" or just the value?
    // Let's return the full class for now as input usually matches that
    return prefix + match[1];
  }
  return "";
};
