import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow'
// CSS import for React Flow
import 'reactflow/dist/style.css'
import { StreamNode } from './nodes/StreamNode'
import { ConsumerNode } from './nodes/ConsumerNode'

const nodeTypes: NodeTypes = {
  stream: StreamNode,
  consumer: ConsumerNode,
}

interface StreamGraphProps {
  initialNodes: any[]
  initialEdges: any[]
  onNodeClick?: (node: any) => void
}

export function StreamGraph({ initialNodes, initialEdges, onNodeClick }: StreamGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleNodeClick = useCallback((_: any, node: any) => {
    onNodeClick?.(node)
  }, [onNodeClick])

  return (
    <div className="h-full w-full bg-surface-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="rgba(100, 116, 139, 0.3)"
        />
        <Controls className="!bg-surface-secondary !border !border-border-default/60 !text-content-primary" />
        <MiniMap
          nodeColor={(node) => {
            return node.type === 'stream' ? '#3b82f6' : '#60a5fa'
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-surface-secondary !border !border-border-default/60"
        />
      </ReactFlow>
    </div>
  )
}
