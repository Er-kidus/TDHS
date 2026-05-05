import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WifiOff } from "lucide-react";

interface OfflineBannerProps {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  const { t } = useLanguage();

  if (!isOffline) return null;

  return (
    <div className="bg-warning/15 border-b border-warning/30 px-4 py-2 flex items-center gap-2 text-sm">
      <WifiOff className="h-4 w-4 text-warning" />
      <span className="text-warning-foreground font-medium">{t("offline.banner")}</span>
    </div>
  );
};
