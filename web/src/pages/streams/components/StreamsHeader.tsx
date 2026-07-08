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
           <Button variant="secondary" icon={<RefreshCw className="icon-base" />} onClick={onRefetch}>
             {t("common.refresh")}
           </Button>
           <Button variant="primary" icon={<Plus className="icon-base" />} onClick={onShowCreateModal}>
             {t("streams.createStream")}
           </Button>
         </>
       }
    />
  );
}
