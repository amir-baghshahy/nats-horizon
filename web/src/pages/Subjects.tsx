import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Search, RefreshCw, ChevronRight, ChevronDown,
  MessageSquare, Globe, Activity, FolderOpen
} from 'lucide-react'

export default function Subjects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const { data: subjects, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => axios.get('/api/subjects').then(res => res.data),
    refetchInterval: 10000,
  })

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  // Group subjects by first segment for tree view
  const buildSubjectTree = () => {
    const groups = new Map<string, { children: any[], count: number }>()

    subjects?.forEach((s: any) => {
      const subject = s.subject || ''
      const parts = subject.split('.')
      const topLevel = parts[0] || 'root'

      if (!groups.has(topLevel)) {
        groups.set(topLevel, { children: [], count: 0 })
      }

      const group = groups.get(topLevel)!
      group.count += s.msg_count || 0
      group.children.push({ ...s, name: subject, rest: parts.slice(1).join('.') })
    })

    return Array.from(groups.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      children: data.children,
    }))
  }

  const subjectTree = buildSubjectTree()

  const renderNode = (node: any, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.name)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.name} style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        <div
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-bg/50 transition-colors cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.name)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-dark-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-dark-muted" />
            )
          ) : (
            <div className="w-4" />
          )}

          {node.name.includes('>') ? (
            <Globe className="w-4 h-4 text-primary-400" />
          ) : (
            <Activity className="w-4 h-4 text-dark-muted" />
          )}

          <span className={depth === 0 ? 'font-semibold' : ''}>{node.name}</span>
          <span className="ml-auto text-xs text-dark-muted">
            {node.count?.toLocaleString()} msgs
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child: any) => (
              <div key={child.name || child.subject} className="flex items-center gap-2 p-2 pl-8 text-sm text-dark-muted">
                <Activity className="w-4 h-4" />
                <span className="font-mono">{child.name || child.subject}</span>
                <span className="ml-auto text-xs">{(child.msg_count || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Filter subjects for list view
  const filteredSubjects = subjects?.filter((s: any) =>
    (s.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Subjects</h1>
          <p className="text-dark-muted mt-1">Subjects from NATS JetStream streams</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center bg-dark-bg rounded-lg p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'tree' ? 'bg-primary-600 text-white' : 'text-dark-muted'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Tree
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-dark-muted'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {(!subjects || subjects.length === 0) && (
        <div className="card text-center p-12">
          <Globe className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Subjects Found</h3>
          <p className="text-dark-muted">Create streams with subjects to see them here.</p>
        </div>
      )}

      {/* Content */}
      {subjects && subjects.length > 0 && (
        <>
          {viewMode === 'tree' ? (
            <div className="card p-4">
              <div className="space-y-1">
                {subjectTree.map(node => renderNode(node))}
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((s: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          {(s.subject || '').includes('>') ? (
                            <Globe className="w-4 h-4 text-primary-400" />
                          ) : (
                            <Activity className="w-4 h-4 text-dark-muted" />
                          )}
                          <span className="font-mono">{s.subject}</span>
                        </div>
                      </td>
                      <td>{(s.msg_count || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
