import { useState } from 'react'
import { useVisualStreamData } from './visual-stream-graph/hooks/useVisualStreamData'
import { StreamGraph } from './visual-stream-graph/components/StreamGraph'
import { NodeDetailsPanel } from './visual-stream-graph/components/details/NodeDetailsPanel'
import { useTranslation } from 'react-i18next'
import { Database } from 'lucide-react'

interface GraphNode {
  id: string
  type: 'stream' | 'consumer' | 'subject'
  data: any
  position: { x: number; y: number }
}

export default function VisualStreamGraph() {
  const { t } = useTranslation()
  const { graphData } = useVisualStreamData()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  if (graphData.nodes.length === 0 && graphData.edges.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database className="mx-auto mb-4 h-16 w-16 text-content-tertiary opacity-50" />
          <h3 className="mb-2 text-display-lg font-medium text-content-primary">
            {t('visualStreamGraph.noStreams')}
          </h3>
          <p className="text-content-tertiary">
            No streams found. Create your first stream to see the visual graph.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
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
    </div>
  )
}
