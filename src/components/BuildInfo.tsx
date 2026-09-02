import { useTranslation } from "react-i18next";

import { APP_VERSION, formatCommitDate, GIT_COMMIT } from "@/lib/version";

export function BuildInfo() {
  const { t, i18n } = useTranslation();

  return (
    <p className="text-xs text-muted-foreground">
      {t("footer.version", {
        version: APP_VERSION,
        commit: GIT_COMMIT,
        date: formatCommitDate(i18n.language),
      })}
    </p>
  );
}
