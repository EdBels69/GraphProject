/**
 * Graph Analytics Panel Component
 * Displays centrality, communities, and gap analysis results
 */

import { useState, useMemo } from 'react'
import { BarChart3, Users, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Graph } from '../../shared/types'
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
        <div className="space-y-4">
            {/* Centrality Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleSection('centrality')}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold">Централизованность</h3>
                        </div>
                        {expandedSection === 'centrality' ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </CardHeader>
                {expandedSection === 'centrality' && (
                    <CardBody className="pt-0">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {analytics.centrality.slice(0, 10).map((node, i) => (
                                <div key={node.nodeId} className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium truncate max-w-[100px]" title={node.label}>
                                            {node.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span title="PageRank">PR: {(node.pagerank * 100).toFixed(1)}%</span>
                                        <span title="Degree">D: {node.degree}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                )}
            </Card>

            {/* Communities Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleSection('communities')}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold">Сообщества</h3>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                {analytics.communityNodes.size}
                            </span>
                        </div>
                        {expandedSection === 'communities' ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </CardHeader>
                {expandedSection === 'communities' && (
                    <CardBody className="pt-0">
                        <div className="mb-3 text-sm">
                            <span className="text-gray-600">Модулярность:</span>
                            <span className="ml-2 font-medium">{analytics.modularity.toFixed(3)}</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {Array.from(analytics.communityNodes).map(([communityId, nodes]) => (
                                <div key={communityId} className="p-2 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">Кластер {communityId + 1}</span>
                                        <span className="text-xs text-gray-500">{nodes.length} узлов</span>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">
                                        {nodes.slice(0, 4).map(id =>
                                            graph.nodes.find(n => n.id === id)?.label || id
                                        ).join(', ')}
                                        {nodes.length > 4 && ` +${nodes.length - 4}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                )}
            </Card>

            {/* Research Gaps Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleSection('gaps')}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold">Пробелы</h3>
                            {(analytics.gaps.sparseAreas.length > 0 || analytics.gaps.bridgeOpportunities.length > 0) && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                    {analytics.gaps.sparseAreas.length + analytics.gaps.bridgeOpportunities.length}
                                </span>
                            )}
                        </div>
                        {expandedSection === 'gaps' ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </CardHeader>
                {expandedSection === 'gaps' && (
                    <CardBody className="pt-0">
                        {analytics.gaps.isolatedNodes.length > 0 && (
                            <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Изолированные узлы:</p>
                                <p className="text-xs text-gray-600">
                                    {analytics.gaps.isolatedNodes.slice(0, 5).map(id =>
                                        graph.nodes.find(n => n.id === id)?.label || id
                                    ).join(', ')}
                                    {analytics.gaps.isolatedNodes.length > 5 && ` +${analytics.gaps.isolatedNodes.length - 5}`}
                                </p>
                            </div>
                        )}

                        {analytics.gaps.sparseAreas.length > 0 && (
                            <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Разреженные области:</p>
                                {analytics.gaps.sparseAreas.slice(0, 3).map((area, i) => (
                                    <div key={i} className="text-xs bg-orange-50 p-2 rounded mb-1">
                                        <p className="text-orange-800">{area.suggestion}</p>
                                        <p className="text-gray-500 mt-1">Плотность: {(area.density * 100).toFixed(1)}%</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analytics.gaps.bridgeOpportunities.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Возможные связи:</p>
                                {analytics.gaps.bridgeOpportunities.slice(0, 3).map((bridge, i) => (
                                    <div key={i} className="text-xs bg-blue-50 p-2 rounded mb-1">
                                        <p className="text-blue-800">
                                            Кластер {bridge.community1 + 1} ↔ Кластер {bridge.community2 + 1}
                                        </p>
                                        <p className="text-gray-500 mt-1">
                                            Потенциальных связей: {bridge.potentialLinks.length}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {analytics.gaps.sparseAreas.length === 0 &&
                            analytics.gaps.bridgeOpportunities.length === 0 &&
                            analytics.gaps.isolatedNodes.length === 0 && (
                                <p className="text-sm text-gray-500">Пробелов не обнаружено</p>
                            )}
                    </CardBody>
                )}
            </Card>
        </div>
    )
}

export default AnalyticsPanel
