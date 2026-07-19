import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useVisualStreamData } from "./visual-stream-graph/hooks/useVisualStreamData";
import { StreamGraph } from "./visual-stream-graph/components/StreamGraph";
import { NodeDetailsPanel } from "./visual-stream-graph/components/details/NodeDetailsPanel";
import { useTranslation } from "react-i18next";
import { Database, Network, RefreshCw } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { Button } from "../components/ui";

interface GraphNode {
  id: string;
  type: "stream" | "consumer" | "subject";
  data: any;
  position: { x: number; y: number };
}

export default function VisualStreamGraph() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { graphData, sseConnected } = useVisualStreamData();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const isEmpty = graphData.nodes.length === 0 && graphData.edges.length === 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title={t("visualStreamGraph.title")}
          subtitle={t("visualStreamGraph.subtitle")}
          icon={Network}
          sseConnected={sseConnected}
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["streams"] });
                queryClient.invalidateQueries({ queryKey: ["consumers"] });
              }}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label={t("common.refresh")}
            />
          }
        />
      </div>

      <div className="flex-1 min-h-0 card overflow-hidden flex">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <Database className="mx-auto mb-4 h-16 w-16 text-content-tertiary opacity-50" />
              <h3 className="mb-2 text-display-lg font-medium text-content-primary">
                {t("visualStreamGraph.noStreams")}
              </h3>
              <p className="text-content-tertiary">
                {t("visualStreamGraph.noStreamsDescription")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <StreamGraph
                initialNodes={graphData.nodes}
                initialEdges={graphData.edges}
                onNodeClick={setSelectedNode}
              />
            </div>
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
