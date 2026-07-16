import { useTranslation } from "react-i18next";

interface LiveIndicatorProps {
  connected: boolean;
  className?: string;
}

export default function LiveIndicator({ connected, className = "" }: LiveIndicatorProps) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-display-xs font-medium shrink-0 ${
        connected
          ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/25"
          : "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/25"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
          connected ? "bg-green-400 animate-live-blink" : "bg-yellow-400"
        }`}
      />
      {connected ? t("common.live") : t("common.polling")}
    </span>
  );
}
