import { Search, Filter, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Select from "../../../components/ui/Select";
import PanelCard from "../../../components/ui/PanelCard";
import { Button } from "../../../components/ui";

interface StreamSelectorProps {
  streams: any[];
  selectedStream: string;
  searchQuery: string;
  showFilters: boolean;
  onStreamChange: (stream: string) => void;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
}

export default function StreamSelector({
  streams,
  selectedStream,
  searchQuery,
  showFilters,
  onStreamChange,
  onSearchChange,
  onToggleFilters,
  onRefresh,
}: StreamSelectorProps) {
  const { t } = useTranslation();
  return (
    <PanelCard className="mb-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-display-sm text-content-tertiary mb-2">{t('messages.selectStream')}</label>
          <Select
            value={selectedStream}
            onChange={onStreamChange}
            options={streams?.map((stream: any) => ({
              value: stream.config?.name || stream.name,
              label: `${stream.config?.name || stream.name} (${stream.state?.messages?.toLocaleString()} messages)`
            })) || []}
            placeholder={t('messages.selectStream')}
            className="w-full"
          />
        </div>
        <div className="flex-1 relative">
          <label className="block text-display-sm text-content-tertiary mb-2">{t('messages.searchMessages')}</label>
          <Search className="absolute left-3 top-9 icon-base text-content-tertiary" />
          <input
            type="text"
            placeholder={t('messages.searchMessagesPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-end gap-3">
          <Button variant="secondary" onClick={onToggleFilters} icon={<Filter className="icon-base" />}>
            {showFilters ? t('messages.lessFilters') : t('messages.filters')}
          </Button>
          <Button variant="secondary" onClick={onRefresh} icon={<RefreshCw className="icon-base" />} />
        </div>
      </div>
    </PanelCard>
  );
}
