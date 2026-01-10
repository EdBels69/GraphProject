import { useState, useMemo } from 'react'
import { BarChart3, Users, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Activity, Share2, Loader2 } from 'lucide-react'
import { Graph } from '../../shared/contracts/graph'
import { useApi } from '@/hooks/useApi'
import { CentralityResult, GraphStatistics } from '../../shared/contracts/analysis'

interface AnalyticsPanelProps {
    graph: Graph
}

export function AnalyticsPanel({ graph }: AnalyticsPanelProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('centrality')

    // Fetch analytics from backend
    const { data: centrality, loading: loadingCentrality } = useApi<CentralityResult[]>(`/analysis/${graph.id}/centrality`)
    const { data: communitiesData, loading: loadingCommunities } = useApi<{
        communities: Record<string, number>;
        modularity: number;
        communityNodes: Record<number, string[]>
    }>(`/analysis/${graph.id}/communities`)
    const { data: gaps, loading: loadingGaps } = useApi<{
        sparseAreas: Array<{ nodes: string[]; density: number; suggestion: string }>
        bridgeOpportunities: Array<{ community1: number; community2: number; potentialLinks: Array<{ source: string; target: string }> }>
        isolatedNodes: string[]
    }>(`/analysis/${graph.id}/gaps`)

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    if (loadingCentrality && !centrality) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <Loader2 className="w-8 h-8 text-acid animate-spin" />
                <p className="text-steel font-mono text-[10px] tracking-widest uppercase">Analyzing Matrix...</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 font-sans pb-20">
            {/* Centrality Section */}
            <div className={`
                border border-ash/20 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'centrality' ? 'bg-void shadow-md' : 'bg-transparent hover:bg-steel/5'}
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
                            <h3 className="font-bold text-steel text-sm tracking-wide">TOP_NODES</h3>
                            <p className="text-[10px] text-steel-dim">Ranked by Centrality</p>
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
                        {loadingCentrality ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 text-acid animate-spin" /></div>
                        ) : centrality ? (
                            <div className="space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-ash/30">
                                {centrality.slice(0, 10).map((node, i) => (
                                    <div key={node.nodeId} className="flex items-center justify-between p-2 rounded-lg bg-steel/5 hover:bg-steel/10 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className={`
                                                w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono
                                                ${i < 3 ? 'bg-acid text-void' : 'bg-white/10 text-steel'}
                                            `}>
                                                {i + 1}
                                            </span>
                                            <span className="font-mono text-xs text-steel truncate max-w-[120px]" title={node.nodeName}>
                                                {node.nodeName}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5">
                                            <div className="flex items-center gap-1 text-[10px] text-steel-dim">
                                                <Activity className="w-3 h-3" />
                                                PR: {(node.pagerank * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-[9px] text-steel-dim/60">
                                                DEG: {node.degree}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-steel-dim italic text-center py-4">No data available</p>
                        )}
                    </div>
                )}
            </div>

            {/* Communities Section */}
            <div className={`
                border border-ash/20 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'communities' ? 'bg-void shadow-md' : 'bg-transparent hover:bg-steel/5'}
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
                            <h3 className="font-bold text-steel text-sm tracking-wide">COMMUNITIES</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-steel-dim">Modularity: Isolate Groups</span>
                                <span className="text-[10px] bg-acid/20 text-acid px-1.5 rounded-sm font-mono">
                                    {communitiesData ? Object.keys(communitiesData.communityNodes).length : 0}
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
                        {loadingCommunities ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 text-acid animate-spin" /></div>
                        ) : communitiesData ? (
                            <>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <span className="text-[10px] font-mono text-steel-dim uppercase tracking-widest">Modularity Score</span>
                                    <span className="text-xs font-bold text-steel font-mono">{communitiesData.modularity.toFixed(3)}</span>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-ash/30">
                                    {Object.entries(communitiesData.communityNodes).map(([communityId, nodes]) => (
                                        <div key={communityId} className="p-3 bg-steel/5 border border-ash/10 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-xs text-acid">CLUSTER_{parseInt(communityId) + 1}</span>
                                                <span className="text-[10px] text-steel-dim bg-steel/10 px-2 py-0.5 rounded-full">{nodes.length} NODES</span>
                                            </div>
                                            <p className="text-[10px] text-steel-dim leading-relaxed font-mono truncate">
                                                {nodes.slice(0, 4).map(id =>
                                                    graph.nodes.find(n => n.id === id)?.label || id
                                                ).join(', ')}
                                                {nodes.length > 4 && ` +${nodes.length - 4}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-[10px] text-steel italic text-center py-4">No data available</p>
                        )}
                    </div>
                )}
            </div>

            {/* Research Gaps Section */}
            <div className={`
                border border-ash/20 rounded-xl overflow-hidden transition-all duration-300
                ${expandedSection === 'gaps' ? 'bg-void shadow-md' : 'bg-transparent hover:bg-steel/5'}
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
                            <h3 className="font-bold text-steel text-sm tracking-wide">Network Gaps</h3>
                            <p className="text-[10px] text-steel-dim">Structural Weakness Analysis</p>
                            {gaps && (gaps.sparseAreas.length > 0 || gaps.bridgeOpportunities.length > 0) && (
                                <div className="mt-1 inline-flex text-[9px] bg-orange-500/10 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/20">
                                    {gaps.sparseAreas.length + gaps.bridgeOpportunities.length} ALERTS
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
                        {loadingGaps ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 text-acid animate-spin" /></div>
                        ) : gaps ? (
                            <>
                                {gaps.isolatedNodes.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-steel-dim uppercase mb-2">ISOLATED_NODES</p>
                                        <div className="flex flex-wrap gap-1">
                                            {gaps.isolatedNodes.slice(0, 5).map(id => (
                                                <span key={id} className="text-[10px] px-2 py-1 bg-steel/5 rounded text-steel border border-ash/10">
                                                    {graph.nodes.find(n => n.id === id)?.label || id}
                                                </span>
                                            ))}
                                            {gaps.isolatedNodes.length > 5 && (
                                                <span className="text-[10px] px-2 py-1 text-steel">+ {gaps.isolatedNodes.length - 5}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {gaps.sparseAreas.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-[10px] font-bold text-steel-dim uppercase">SPARSE_CLUSTERS</p>
                                        {gaps.sparseAreas.slice(0, 3).map((area, i) => (
                                            <div key={i} className="text-xs bg-orange-500/5 border border-orange-500/20 p-3 rounded-lg">
                                                <p className="text-orange-900 mb-1 font-medium">{area.suggestion}</p>
                                                <p className="text-orange-900/50 text-[10px]">Density: {(area.density * 100).toFixed(1)}%</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {gaps.bridgeOpportunities.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-steel uppercase">BRIDGE_OPPORTUNITIES</p>
                                        {gaps.bridgeOpportunities.slice(0, 3).map((bridge, i) => (
                                            <div key={i} className="text-xs bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 text-indigo-900 font-medium mb-1">
                                                    <Share2 className="w-3 h-3" />
                                                    Cluster {bridge.community1 + 1} ↔ Cluster {bridge.community2 + 1}
                                                </div>
                                                <p className="text-indigo-900/50 text-[10px]">
                                                    Potential Links: {bridge.potentialLinks.length}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {gaps.sparseAreas.length === 0 &&
                                    gaps.bridgeOpportunities.length === 0 &&
                                    gaps.isolatedNodes.length === 0 && (
                                        <div className="text-center py-4">
                                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2 text-green-600 border border-green-500/20">✔</div>
                                            <p className="text-xs text-steel-dim">No significant structural gaps detected.</p>
                                        </div>
                                    )}
                            </>
                        ) : (
                            <p className="text-[10px] text-steel italic text-center py-4">No gaps detected</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnalyticsPanel
