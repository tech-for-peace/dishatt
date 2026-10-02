import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick}>
      <ArrowLeft />
      {t("picker.goBack")}
    </Button>
  );
}
