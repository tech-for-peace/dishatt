import type { ComponentType, SVGProps } from "react";

import { ApplePodcastIcon, SpotifyIcon, YoutubeIcon } from "@/components/icons/source-icons";
import type { SourceKey } from "@/lib/sources";

type SourceIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SourceVisual = { kind: "icon"; Icon: SourceIcon } | { kind: "logo"; src: string };

export const SOURCE_VISUAL: Record<SourceKey, SourceVisual> = {
  // Official Timeless Today diamond mark only (cropped from their light logo).
  timelessToday: { kind: "logo", src: "/logos/timeless-today-icon.png" },
  youtube: { kind: "icon", Icon: YoutubeIcon },
  intelligentExistence: {
    kind: "logo",
    // Diamond mark only — the site's other asset is a wordmark with the name.
    src: "https://www.intelligentexistence.com/wp-content/uploads/2025/01/IE-LOGO-ICON-bolder_696-SIZE.png",
  },
  spotify: { kind: "icon", Icon: SpotifyIcon },
  applePodcast: { kind: "icon", Icon: ApplePodcastIcon },
};
