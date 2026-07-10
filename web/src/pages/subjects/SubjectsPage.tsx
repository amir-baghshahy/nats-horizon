import type { SubjectInfo } from "../../types";
import { UseSubjectsReturn } from "./hooks/useSubjects";
import { useTranslation } from "react-i18next";
import {
  Hash,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronDown,
  Globe,
  Activity,
  FolderOpen,
  List,
} from "lucide-react";
import { DashboardHeader } from "../../components/dashboard";
import StatCard from "../../components/ui/StatCard";
import { PageLoading, PageError } from "../../components/ui/PageState";
import { FilterBar, EmptyState, PanelCard } from "../../components/ui";

export default function SubjectsPage({
  sseConnected,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  expandedNodes,
  refetch,
  subjects,
  toggleNode,
  buildSubjectTree,
  filteredSubjects,
  totalSubjects,
  totalMessages,
  lastActivity,
  isLoading,
  isError,
}: UseSubjectsReturn) {
  const { t } = useTranslation();
  const hasData = subjects && subjects.length > 0;
  const subjectTree = buildSubjectTree();

  const renderNode = (node: any, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.name);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.name} style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-primary/50 transition-colors cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.name)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="icon-base text-content-tertiary" />
            ) : (
              <ChevronRight className="icon-base text-content-tertiary" />
            )
          ) : (
            <div className="w-4" />
          )}

          {node.name.includes(">") ? (
            <Globe className="icon-base text-primary-400" />
          ) : (
            <Activity className="icon-base text-content-tertiary" />
          )}

          <span className={depth === 0 ? "font-semibold" : ""}>
            {node.name}
          </span>
          <span className="ml-auto text-display-xs text-content-tertiary">
            {t("subjects.messageCount", { count: node.count })}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child: SubjectInfo) => (
              <div
                key={child.name}
                className="flex items-center gap-2 p-2 pl-8 text-display-sm text-content-tertiary"
              >
                <Activity className="icon-base" />
                <span className="font-mono">{child.name}</span>
                <span className="ml-auto text-display-xs">
                  {(child.count || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
        <PageLoading text={t("subjects.loading")} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
        <PageError message={t("subjects.errorMessage")} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 animate-fade-in overflow-hidden">
      <div className="shrink-0">
        <DashboardHeader
          sseConnected={sseConnected}
          onRefresh={() => refetch()}
        />
      </div>

      {/* Summary Stats Section */}
      <section className="shrink-0 animate-slide-up">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            icon={Hash}
            value={totalSubjects || 0}
            label={t("subjects.totalSubjects")}
            iconBg="bg-primary-500/20"
            iconColor="text-primary-400"
          />
          <StatCard
            icon={MessageSquare}
            value={totalMessages || 0}
            label={t("subjects.totalMessages")}
            iconBg="bg-green-500/20"
            iconColor="text-green-400"
          />
          <StatCard
            icon={Clock}
            value={lastActivity || "—"}
            label={t("subjects.lastActivity")}
            iconBg="bg-cyan-500/20"
            iconColor="text-cyan-400"
            formatValue={false}
          />
        </div>
      </section>

      {/* Subject Browser Section */}
      <section className="flex-1 min-h-0 flex flex-col gap-3 animate-slide-up animate-delay-100">
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("subjects.searchPlaceholder")}
          filters={
            <div className="flex items-center bg-surface-primary rounded-lg p-1">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === "tree"
                    ? "bg-primary-600 text-white"
                    : "text-content-tertiary"
                }`}
              >
                <FolderOpen className="icon-base inline mr-2" />
                {t("subjects.tree")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary-600 text-white"
                    : "text-content-tertiary"
                }`}
              >
                <List className="icon-base inline mr-2" />
                {t("subjects.list")}
              </button>
            </div>
          }
        />

        {!hasData ? (
          <EmptyState
            icon={Globe}
            title={t("subjects.noSubjectsFound")}
            description={t("subjects.noSubjectsFoundDescription")}
          />
        ) : (
          <PanelCard
            maxHeight={600}
            footer={
              <span>
                {t("subjects.subjectCount", { count: filteredSubjects.length })}
              </span>
            }
          >
            {viewMode === "tree" ? (
              <div className="overflow-y-auto scrollbar-thin flex-1 p-4">
                <div className="space-y-1">
                  {subjectTree.map((node) => renderNode(node))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto scrollbar-thin flex-1">
                <table className="table">
                  <thead className="sticky top-0 bg-surface-primary z-10">
                    <tr>
                      <th>{t("subjects.subject")}</th>
                      <th>{t("subjects.messages")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((s: SubjectInfo, i: number) => (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2">
                            {(s.name || "").includes(">") ? (
                              <Globe className="icon-base text-primary-400" />
                            ) : (
                              <Activity className="icon-base text-content-tertiary" />
                            )}
                            <span className="font-mono">{s.name}</span>
                          </div>
                        </td>
                        <td>{(s.count || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PanelCard>
        )}
      </section>
    </div>
  );
}
