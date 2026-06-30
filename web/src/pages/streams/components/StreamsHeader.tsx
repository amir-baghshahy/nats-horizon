import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui";
import { Button } from "../../../components/ui";

interface StreamsHeaderProps {
  sseConnected: boolean;
  onShowCreateModal: () => void;
  onRefetch: () => void;
}

export default function StreamsHeader({
  sseConnected,
  onShowCreateModal,
  onRefetch,
}: StreamsHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t("streams.title")}
      subtitle={t("streams.subtitle")}
      sseConnected={sseConnected}
      sseLabel={t("common.live")}
      sseDisconnectedLabel={t("common.connecting")}
       actions={
         <>
           <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={onRefetch}>
             {t("common.refresh")}
           </Button>
           <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onShowCreateModal}>
             {t("streams.createStream")}
           </Button>
         </>
       }
    />
  );
}
