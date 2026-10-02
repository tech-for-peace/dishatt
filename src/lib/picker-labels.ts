import { sourceLabelKey, type ActiveSource } from "@/lib/sources";

const CATEGORY_TITLE_KEY: Record<string, string> = {
  "all:Video": "picker.allVideo",
  "all:Music": "picker.allMusic",
  "timelessToday:Video": "picker.ttVideo",
  "timelessToday:Music": "picker.ttMusic",
  "youtube:Video": "picker.ytVideo",
  "youtube:Music": "picker.ytMusic",
};

/** Human title for a picker selection (source + optional category). */
export function pickerSelectionTitle(
  source: ActiveSource,
  category: string | undefined,
  t: (key: string) => string,
): string {
  const key = category ? CATEGORY_TITLE_KEY[`${source}:${category}`] : undefined;
  return t(key ?? sourceLabelKey(source));
}
