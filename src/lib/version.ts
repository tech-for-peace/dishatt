export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "dev";
export const GIT_COMMIT = import.meta.env.VITE_GIT_COMMIT || "dev";
export const GIT_COMMIT_DATE =
  import.meta.env.VITE_GIT_COMMIT_DATE || new Date().toISOString();

export function formatCommitDate(locale: string): string {
  const date = new Date(GIT_COMMIT_DATE);
  if (Number.isNaN(date.getTime())) return GIT_COMMIT_DATE;
  return date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
