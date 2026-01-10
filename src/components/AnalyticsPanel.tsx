import { useState, useMemo } from 'react'
import { BarChart3, Users, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Activity, Share2 } from 'lucide-react'
import { Graph } from '../../shared/contracts/graph'
import { GraphAnalyzer } from '../../shared/graphAlgorithms'

interface AnalyticsPanelProps {
    graph: Graph
}

export function AnalyticsPanel({ graph }: AnalyticsPanelProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('centrality')

    // Calculate analytics using memoization
    const analytics = useMemo(() => {
        const analyzer = new GraphAnalyzer(graph)

        const centrality = analyzer.calculateCentrality()
        const pageRank = analyzer.calculatePageRank()
        const { communities, modularity, communityNodes } = analyzer.detectCommunities()
        const gaps = analyzer.detectGaps()

        // Combine centrality with PageRank
        const enrichedCentrality = centrality.map(c => ({
            ...c,
            pagerank: pageRank.get(c.nodeId) || 0,
            label: graph.nodes.find(n => n.id === c.nodeId)?.label || c.nodeId
        })).sort((a, b) => b.pagerank - a.pagerank)

        return {
            centrality: enrichedCentrality,
            communities,
            modularity,
            communityNodes,
            gaps
        }
    }, [graph])

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    return (
        <div className="space-y-3 font-sans pb-20">
            {/* Centrality Section */}
            <div className={`
                border border-white/10 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'centrality' ? 'bg-white/5 shadow-lg' : 'bg-transparent hover:bg-white/5'}
            `}>
                <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('centrality')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-plasma/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-plasma" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm tracking-wide">TOP_NODES</h3>
                            <p className="text-[10px] text-steel">Ranked by Centrality</p>
                        </div>
                    </div>
                    {expandedSection === 'centrality' ? (
                        <ChevronUp className="w-4 h-4 text-steel" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-steel" />
                    )}
                </div>

                {expandedSection === 'centrality' && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {analytics.centrality.slice(0, 10).map((node, i) => (
                                <div key={node.nodeId} className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className={`
                                            w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono
                                            ${i < 3 ? 'bg-acid text-void' : 'bg-white/10 text-steel'}
                                        `}>
                                            {i + 1}
                                        </span>
                                        <span className="font-mono text-xs text-white truncate max-w-[120px]" title={node.label}>
                                            {node.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="flex items-center gap-1 text-[10px] text-steel">
                                            <Activity className="w-3 h-3" />
                                            PR: {(node.pagerank * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-[9px] text-white/40">
                                            DEG: {node.degree}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Communities Section */}
            <div className={`
                border border-white/10 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'communities' ? 'bg-white/5 shadow-lg' : 'bg-transparent hover:bg-white/5'}
            `}>
                <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('communities')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-acid/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-acid" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm tracking-wide">COMMUNITIES</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-steel">Modularity: Isolate Groups</span>
                                <span className="text-[10px] bg-acid/20 text-acid px-1.5 rounded-sm font-mono">
                                    {analytics.communityNodes.size}
                                </span>
                            </div>
                        </div>
                    </div>
                    {expandedSection === 'communities' ? (
                        <ChevronUp className="w-4 h-4 text-steel" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-steel" />
                    )}
                </div>

                {expandedSection === 'communities' && (
                    <div className="px-4 pb-4">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <span className="text-[10px] font-mono text-steel uppercase tracking-widest">Modularity Score</span>
                            <span className="text-xs font-bold text-white font-mono">{analytics.modularity.toFixed(3)}</span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {Array.from(analytics.communityNodes).map(([communityId, nodes]) => (
                                <div key={communityId} className="p-3 bg-white/5 border border-white/5 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-xs text-acid">CLUSTER_{communityId + 1}</span>
                                        <span className="text-[10px] text-steel bg-black/40 px-2 py-0.5 rounded-full">{nodes.length} NODES</span>
                                    </div>
                                    <p className="text-[10px] text-white/60 leading-relaxed font-mono truncate">
                                        {nodes.slice(0, 4).map(id =>
                                            graph.nodes.find(n => n.id === id)?.label || id
                                        ).join(', ')}
                                        {nodes.length > 4 && ` +${nodes.length - 4}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Research Gaps Section */}
            <div className={`
                border border-white/10 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'gaps' ? 'bg-white/5 shadow-lg' : 'bg-transparent hover:bg-white/5'}
            `}>
                <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('gaps')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm tracking-wide">Network Gaps</h3>
                            <p className="text-[10px] text-steel">Structural Weakness Analysis</p>
                            {(analytics.gaps.sparseAreas.length > 0 || analytics.gaps.bridgeOpportunities.length > 0) && (
                                <div className="mt-1 inline-flex text-[9px] bg-orange-500/10 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/20">
                                    {analytics.gaps.sparseAreas.length + analytics.gaps.bridgeOpportunities.length} ALERTS
                                </div>
                            )}
                        </div>
                    </div>
                    {expandedSection === 'gaps' ? (
                        <ChevronUp className="w-4 h-4 text-steel" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-steel" />
                    )}
                </div>

                {expandedSection === 'gaps' && (
                    <div className="px-4 pb-4">
                        {analytics.gaps.isolatedNodes.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-steel uppercase mb-2">ISOLATED_NODES</p>
                                <div className="flex flex-wrap gap-1">
                                    {analytics.gaps.isolatedNodes.slice(0, 5).map(id => (
                                        <span key={id} className="text-[10px] px-2 py-1 bg-white/5 rounded text-white/70 border border-white/5">
                                            {graph.nodes.find(n => n.id === id)?.label || id}
                                        </span>
                                    ))}
                                    {analytics.gaps.isolatedNodes.length > 5 && (
                                        <span className="text-[10px] px-2 py-1 text-steel">+ {analytics.gaps.isolatedNodes.length - 5}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {analytics.gaps.sparseAreas.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-[10px] font-bold text-steel uppercase">SPARSE_CLUSTERS</p>
                                {analytics.gaps.sparseAreas.slice(0, 3).map((area, i) => (
                                    <div key={i} className="text-xs bg-orange-500/5 border border-orange-500/10 p-3 rounded-lg">
                                        <p className="text-orange-200 mb-1 font-medium">{area.suggestion}</p>
                                        <p className="text-orange-200/50 text-[10px]">Density: {(area.density * 100).toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analytics.gaps.bridgeOpportunities.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-steel uppercase">BRIDGE_OPPORTUNITIES</p>
                                {analytics.gaps.bridgeOpportunities.slice(0, 3).map((bridge, i) => (
                                    <div key={i} className="text-xs bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-indigo-200 font-medium mb-1">
                                            <Share2 className="w-3 h-3" />
                                            Cluster {bridge.community1 + 1} ↔ Cluster {bridge.community2 + 1}
                                        </div>
                                        <p className="text-indigo-200/50 text-[10px]">
                                            Potential Links: {bridge.potentialLinks.length}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analytics.gaps.sparseAreas.length === 0 &&
                            analytics.gaps.bridgeOpportunities.length === 0 &&
                            analytics.gaps.isolatedNodes.length === 0 && (
                                <div className="text-center py-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 text-green-500">✔</div>
                                    <p className="text-xs text-white/60">No significant structural gaps detected.</p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnalyticsPanel
