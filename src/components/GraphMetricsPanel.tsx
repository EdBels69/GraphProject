import React, { useMemo } from 'react'
import { UniversalGraph } from '../../shared/contracts/graph'
import { Info, BarChart2, Share2, Layers } from 'lucide-react'

interface Props {
    graph: UniversalGraph
}

export function GraphMetricsPanel({ graph }: Props) {
    const stats = useMemo(() => {
        const nodes = graph.nodes
        const edges = graph.edges

        // Calculate degree distribution
        const degrees = new Map<string, number>()
        edges.forEach(e => {
            degrees.set(e.source, (degrees.get(e.source) || 0) + 1)
            degrees.set(e.target, (degrees.get(e.target) || 0) + 1)
        })

        const maxDegree = Math.max(...Array.from(degrees.values()), 0)
        const avgDegree = nodes.length > 0 ? (2 * edges.length) / nodes.length : 0

        // Count types
        const types = new Map<string, number>()
        nodes.forEach(n => types.set(n.type, (types.get(n.type) || 0) + 1))

        return {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            density: graph.metrics.density || 0,
            avgDegree,
            maxDegree,
            types: Array.from(types.entries()).sort((a, b) => b[1] - a[1])
        }
    }, [graph])

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-steel flex items-center gap-2">
                <BarChart2 size={18} /> Network Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <MetricCard
                    label="Nodes"
                    value={stats.nodeCount}
                    icon={<Layers size={14} />}
                />
                <MetricCard
                    label="Edges"
                    value={stats.edgeCount}
                    icon={<Share2 size={14} />}
                />
                <MetricCard
                    label="Density"
                    value={stats.density.toFixed(3)}
                    subtext="Connectivity"
                />
                <MetricCard
                    label="Avg. Degree"
                    value={stats.avgDegree.toFixed(2)}
                    subtext="Neighbors/Node"
                />
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium text-steel-dim mb-2 uppercase tracking-wide">
                    Node Distribution
                </h4>
                <div className="space-y-2">
                    {stats.types.slice(0, 5).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between text-sm">
                            <span className="text-steel">{type}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-steel-dim">{count}</span>
                                <div className="w-16 h-1.5 bg-ash/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-plasma"
                                        style={{ width: `${(count / stats.nodeCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MetricCard({ label, value, subtext, icon }: any) {
    return (
        <div className="bg-ash/5 border border-ash/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-steel-dim text-xs uppercase">{label}</span>
                {icon && <span className="text-steel-dim opacity-50">{icon}</span>}
            </div>
            <div className="text-xl font-bold text-steel">{value}</div>
            {subtext && <div className="text-xs text-steel-dim mt-1">{subtext}</div>}
        </div>
    )
}
